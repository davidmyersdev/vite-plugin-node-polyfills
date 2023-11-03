import { readFileSync } from 'node:fs'
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
   * Includes specific modules. If empty, includes all modules
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   include: ['fs', 'path'],
   * })
   * ```
  */
  include?: ModuleNameWithoutNodePrefix[],
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
   * Specify alternative modules to use in place of the default polyfills.
   *
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   overrides: {
   *     fs: 'memfs',
   *   },
   * })
   * ```
   */
  overrides?: { [Key in ModuleNameWithoutNodePrefix]?: string },
  /**
   * Specify whether the Node protocol version of an import (e.g. `node:buffer`) should be polyfilled too.
   *
   * @default true
   */
  protocolImports?: boolean,
}

export type PolyfillOptionsResolved = {
  include: ModuleNameWithoutNodePrefix[],
  exclude: ModuleNameWithoutNodePrefix[],
  globals: {
    Buffer: BooleanOrBuildTarget,
    global: BooleanOrBuildTarget,
    process: BooleanOrBuildTarget,
  },
  overrides: { [Key in ModuleNameWithoutNodePrefix]?: string },
  protocolImports: boolean,
}

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

const stripNodePrefix = (name: ModuleName): ModuleNameWithoutNodePrefix => {
  return name.replace(/^node:/, '') as ModuleNameWithoutNodePrefix
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
  const globalShimsBannerPath = require.resolve('vite-plugin-node-polyfills/shims/banner')
  const globalShimsBanner = readFileSync(globalShimsBannerPath, 'utf-8')
  const optionsResolved: PolyfillOptionsResolved = {
    include: [],
    exclude: [],
    overrides: {},
    protocolImports: true,
    ...options,
    globals: {
      Buffer: true,
      global: true,
      process: true,
      ...options.globals,
    },
  }

  const compareExcludedModuleNames = (moduleName: string, excludedName: string) => {
    return moduleName === excludedName || moduleName === `node:${excludedName}`;
  }

  const isExcluded = (name: string) => {
    if (optionsResolved.include.length) {
      return !optionsResolved.include.some((excludedName) => compareExcludedModuleNames(name, excludedName));
    };
    return optionsResolved.exclude.some((excludedName) => compareExcludedModuleNames(name, excludedName));
  }

  const toOverride = (name: ModuleNameWithoutNodePrefix): string | void => {
    if (isDevEnabled(optionsResolved.globals.Buffer) && /^buffer$/.test(name)) {
      return require.resolve('buffer-polyfill')
    }

    if (name in optionsResolved.overrides) {
      return optionsResolved.overrides[name]
    }
  }

  return {
    name: 'vite-plugin-node-polyfills',
    config: (config, env) => {
      const isDev = env.command === 'serve'
      const polyfills = (Object.entries(stdLibBrowser) as Array<[ModuleName, string]>).reduce<Record<ModuleName, string>>((included, [name, value]) => {
        if (!optionsResolved.protocolImports) {
          if (isProtocolImport(name)) {
            return included
          }
        }

        if (!isExcluded(name)) {
          included[name] = toOverride(stripNodePrefix(name)) || value
        }

        return included
      }, {} as Record<ModuleName, string>)

      return {
        build: {
          rollupOptions: {
            onwarn: (warning, rollupWarn) => {
              handleCircularDependancyWarning(warning, config.build?.rollupOptions?.onwarn ?? rollupWarn)
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
          banner: isDev ? globalShimsBanner : undefined,
        },
        optimizeDeps: {
          esbuildOptions: {
            banner: isDev ? { js: globalShimsBanner } : undefined,
            // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L203-L209
            define: {
              ...(isDev && isDevEnabled(optionsResolved.globals.Buffer) ? { Buffer: 'Buffer' } : {}),
              ...(isDev && isDevEnabled(optionsResolved.globals.global) ? { global: 'global' } : {}),
              ...(isDev && isDevEnabled(optionsResolved.globals.process) ? { process: 'process' } : {}),
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
