import { createRequire } from 'node:module'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'

export type ModuleName = keyof typeof stdLibBrowser
export type ModuleNameWithoutNodePrefix<T = ModuleName> = T extends `node:${infer P}` ? P : never

interface PolyfillOptions {
  /**
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   exclude: ['fs', 'path']
   * })
   * ```
   */
  exclude: ModuleNameWithoutNodePrefix[],
  /**
   * @default true
   */
  protocolImports: boolean,
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
 *       // Whether to polyfill `node:` protocol imports.
 *       protocolImports: true,
 *     }),
 *   ],
 * })
 * ```
 */
export const nodePolyfills = (options: Partial<PolyfillOptions> = {}): Plugin => {
  const require = createRequire(import.meta.url)
  const globalShimsPath = require.resolve('node-stdlib-browser/helpers/esbuild/shim')
  const optionsResolved: PolyfillOptions = {
    exclude: [],
    protocolImports: true,
    // User options take priority.
    ...options,
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
          included[name] = value
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
                  global: [globalShimsPath, 'global'],
                  process: [globalShimsPath, 'process'],
                  Buffer: [globalShimsPath, 'Buffer'],
                }),
              },
            ],
          },
        },
        optimizeDeps: {
          esbuildOptions: {
            // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L203-L209
            define: {
              Buffer: 'Buffer',
              global: 'global',
              process: 'process',
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
                  const filter = new RegExp(`^${escapedGlobalShimsPath}$`)

                  // https://esbuild.github.io/plugins/#on-resolve
                  build.onResolve({ filter }, () => {
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
