import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    force: true,
  },
  plugins: [
    nodePolyfills(),
  ],
})
