import { createRequire } from 'node:module'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'

export type BuildTarget = 'build' | 'dev'
export type BooleanOrBuildTarget = boolean | BuildTarget
export type ModuleName = keyof typeof stdLibBrowser
export type ModuleNameWithoutNodePrefix<T = ModuleName> = T extends `node:${infer P}` ? P : never

export type PolyfillOptions = {
  /**
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   exclude: ['fs', 'path'],
   * })
   * ```
   */
  exclude?: ModuleNameWithoutNodePrefix[],
  /**
   * Specify whether specific globals should be polyfilled.
   *
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   globals: {
   *     Buffer: false,
   *     global: true,
   *     process: 'build',
   *   },
   * })
   * ```
   */
  globals?: {
    Buffer?: BooleanOrBuildTarget,
    global?: BooleanOrBuildTarget,
    process?: BooleanOrBuildTarget,
  },
  /**
   * @default true
   */
  protocolImports?: boolean,
}

export type PolyfillOptionsResolved = {
  exclude: ModuleNameWithoutNodePrefix[],
  globals: {
    Buffer: BooleanOrBuildTarget,
    global: BooleanOrBuildTarget,
    process: BooleanOrBuildTarget,
  },
  protocolImports: boolean,
}

const globals = ['buffer', 'global', 'process'].flatMap(name => [name, `node:${name}`])

const isBuildEnabled = (value: BooleanOrBuildTarget) => {
  if (!value) return false
  if (value === true) return true

  return value === 'build'
}

const isDevEnabled = (value: BooleanOrBuildTarget) => {
  if (!value) return false
  if (value === true) return true

  return value === 'dev'
}

const isProtocolImport = (name: string) => {
  return name.startsWith('node:')
}

/**
 * Returns a Vite plugin to polyfill Node's Core Modules for browser environments. Supports `node:` protocol imports.
 *
 * @example
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import { nodePolyfills } from 'vite-plugin-node-polyfills'
 *
 * export default defineConfig({
 *   plugins: [
 *     nodePolyfills({
 *       // Specific modules that should not be polyfilled.
 *       exclude: [],
 *       // Whether to polyfill specific globals.
 *       globals: {
 *         Buffer: true, // can also be 'build', 'dev', or false
 *         global: true,
 *         process: true,
 *       },
 *       // Whether to polyfill `node:` protocol imports.
 *       protocolImports: true,
 *     }),
 *   ],
 * })
 * ```
 */
export const nodePolyfills = (options: PolyfillOptions = {}): Plugin => {
  const require = createRequire(import.meta.url)
  const globalShimsPath = require.resolve('vite-plugin-node-polyfills/shims')
  const optionsResolved: PolyfillOptionsResolved = {
    exclude: [],
    protocolImports: true,
    ...options,
    globals: {
      Buffer: true,
      global: true,
      process: true,
      ...options.globals,
    },
  }

  const isExcluded = (name: string) => {
    return optionsResolved.exclude.some((excludedName) => {
      return name === excludedName || name === `node:${excludedName}`
    })
  }

  return {
    name: 'vite-plugin-node-polyfills',
    config: (_config, _env) => {
      const polyfills = (Object.entries(stdLibBrowser) as Array<[ModuleName, string]>).reduce<Record<ModuleName, string>>((included, [name, value]) => {
        if (!optionsResolved.protocolImports) {
          if (isProtocolImport(name)) {
            return included
          }
        }

        if (!isExcluded(name)) {
          included[name] = globals.includes(name) ? globalShimsPath : value
        }

        return included
      }, {} as Record<ModuleName, string>)

      return {
        build: {
          rollupOptions: {
            onwarn: (warning, rollupWarn) => {
              handleCircularDependancyWarning(warning, rollupWarn)
            },
            plugins: [
              {
                ...inject({
                  // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md#vite
                  ...(isBuildEnabled(optionsResolved.globals.Buffer) ? { Buffer: [globalShimsPath, 'Buffer'] } : {}),
                  ...(isBuildEnabled(optionsResolved.globals.global) ? { global: [globalShimsPath, 'global'] } : {}),
                  ...(isBuildEnabled(optionsResolved.globals.process) ? { process: [globalShimsPath, 'process'] } : {}),
                }),
              },
            ],
          },
        },
        esbuild: {
          // In dev, the global polyfills need to be injected as a banner in order for isolated scripts (such as Vue SFCs) to have access to them.
          banner: [
            isDevEnabled(optionsResolved.globals.Buffer) ? `import { Buffer as BufferPolyfill } from '${globalShimsPath}'\nwindow.Buffer = BufferPolyfill` : '',
            isDevEnabled(optionsResolved.globals.global) ? `import { global as globalPolyfill } from '${globalShimsPath}'\nwindow.global = globalPolyfill` : '',
            isDevEnabled(optionsResolved.globals.process) ? `import { process as processPolyfill } from '${globalShimsPath}'\nwindow.process = processPolyfill` : '',
          ].join('\n'),
        },
        optimizeDeps: {
          esbuildOptions: {
            // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L203-L209
            define: {
              ...(isDevEnabled(optionsResolved.globals.Buffer) ? { Buffer: 'Buffer' } : {}),
              ...(isDevEnabled(optionsResolved.globals.global) ? { global: 'global' } : {}),
              ...(isDevEnabled(optionsResolved.globals.process) ? { process: 'process' } : {}),
            },
            inject: [
              globalShimsPath,
            ],
            plugins: [
              esbuildPlugin(polyfills),
              // Supress the 'injected path "..." cannot be marked as external' error in Vite 4 (emitted by esbuild).
              // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1469
              {

                name: 'vite-plugin-node-polyfills-shims-resolver',
                setup(build) {
                  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
                  const escapedGlobalShimsPath = globalShimsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                  const globalShimsFilter = new RegExp(`^${escapedGlobalShimsPath}$`)

                  // https://esbuild.github.io/plugins/#on-resolve
                  build.onResolve({ filter: globalShimsFilter }, () => {
                    return {
                      // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1468
                      external: false,
                      path: globalShimsPath,
                    }
                  })
                },
              },
            ],
          },
        },
        resolve: {
          // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L150
          alias: {
            ...polyfills,
          },
        },
      }
    },
  }
}
