import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import type { Plugin } from 'vite'

export const nodePolyfills = (_options = {}): Plugin => {
  return {
    name: 'vite-plugin-node-polyfills',
    // @ts-expect-error The rollupNodePolyFill() function does not match the Vite expected type signature.
    config: (_config, _env) => {
      return {
        build: {
          rollupOptions: {
            plugins: [
              rollupNodePolyFill(),
            ],
          },
        },
        optimizeDeps: {
          esbuildOptions: {
            define: {
              global: 'globalThis'
            },
            plugins: [
              NodeGlobalsPolyfillPlugin({
                buffer: true,
                process: true,
              }),
              NodeModulesPolyfillPlugin(),
            ]
          },
        },
        resolve: {
          alias: {
            _stream_duplex: 'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
            _stream_passthrough: 'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
            _stream_readable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
            _stream_transform: 'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
            _stream_writable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
            assert: 'rollup-plugin-node-polyfills/polyfills/assert',
            console: 'rollup-plugin-node-polyfills/polyfills/console',
            constants: 'rollup-plugin-node-polyfills/polyfills/constants',
            domain: 'rollup-plugin-node-polyfills/polyfills/domain',
            events: 'rollup-plugin-node-polyfills/polyfills/events',
            http: 'rollup-plugin-node-polyfills/polyfills/http',
            https: 'rollup-plugin-node-polyfills/polyfills/http',
            os: 'rollup-plugin-node-polyfills/polyfills/os',
            path: 'rollup-plugin-node-polyfills/polyfills/path',
            punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
            querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
            stream: 'rollup-plugin-node-polyfills/polyfills/stream',
            string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
            sys: 'util',
            timers: 'rollup-plugin-node-polyfills/polyfills/timers',
            tty: 'rollup-plugin-node-polyfills/polyfills/tty',
            url: 'rollup-plugin-node-polyfills/polyfills/url',
            util: 'rollup-plugin-node-polyfills/polyfills/util',
            vm: 'rollup-plugin-node-polyfills/polyfills/vm',
            zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
          },
        },
      }
    },
  }
}
