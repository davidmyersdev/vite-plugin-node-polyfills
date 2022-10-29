import { createRequire } from 'node:module'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'

interface PolyfillOptions {
  protocolImports: boolean
}

/**
 * Returns a Vite plugin to polyfill Node's Core Modules for browser environments. Supports `node:` protocol imports.
 *
 * @example Use it in `vite.config.ts`
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import { nodePolyfills } from 'vite-plugin-node-polyfills'
 *
 * export default defineConfig({
 *   plugins: [
 *     nodePolyfills({
 *       // Whether to polyfill `node:` protocol imports.
 *       protocolImports: true,
 *     }),
 *   ],
 * })
 * ```
 */
export const nodePolyfills = (options: Partial<PolyfillOptions> = {}): Plugin => {
  const require = createRequire(import.meta.url)
  const globalShims = require.resolve('node-stdlib-browser/helpers/esbuild/shim')
  const optionsResolved: PolyfillOptions = {
    protocolImports: true,
    // User options take priority.
    ...options,
  }

  return {
    name: 'vite-plugin-node-polyfills',
    config: (_config, _env) => {
      const polyfills = Object.entries(stdLibBrowser).reduce((included: Record<string, string>, [name, value]) => {
        if (!optionsResolved.protocolImports) {
          const isProtocolImport = /^node:/.test(name)

          if (isProtocolImport) {
            return included
          }
        }

        included[name] = value

        return included
      }, {})

      return {
        build: {
          rollupOptions: {
            onwarn: (warning, rollupWarn) => {
              handleCircularDependancyWarning(warning, rollupWarn)
            },
            plugins: [
              {
                ...inject({
                  // cf. https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md#vite
                  global: [globalShims, 'global'],
                  process: [globalShims, 'process'],
                  Buffer: [globalShims, 'Buffer']
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
              globalShims,
            ],
            plugins: [
              esbuildPlugin(polyfills),
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
