import { createRequire } from 'node:module'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'

export const nodePolyfills = (_options = {}): Plugin => {
  const require = createRequire(import.meta.url)
  const globalShims = require.resolve('node-stdlib-browser/helpers/esbuild/shim')

  return {
    name: 'vite-plugin-node-polyfills',
    config: (_config, _env) => {
      return {
        build: {
          rollupOptions: {
            onwarn: (warning, rollupWarn) => {
              handleCircularDependancyWarning(warning, rollupWarn)
            },
            plugins: [
              {
                ...inject({
                  Buffer: 'Buffer',
                  global: 'global',
                  process: 'process',
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
              esbuildPlugin(stdLibBrowser),
            ],
          },
        },
        resolve: {
          // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L150
          alias: {
            ...stdLibBrowser,
          },
        },
      }
    },
  }
}
