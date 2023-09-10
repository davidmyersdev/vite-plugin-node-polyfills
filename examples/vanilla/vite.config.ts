import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      exclude: ['fs'],
      globals: {
        process: 'build',
      },
      protocolImports: true,
    }),
  ],
  root: resolve(__dirname),
})
