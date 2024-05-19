import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    nodePolyfills({
      globals: {
        process: false,
      },
      protocolImports: true,
    }),
  ],
  root: resolve(__dirname),
})
