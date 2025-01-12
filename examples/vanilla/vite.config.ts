import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    nodePolyfills({
      overrides: {
        fs: 'memfs',
      },
      protocolImports: true,
    }),
  ],
  root: resolve(__dirname),
})
