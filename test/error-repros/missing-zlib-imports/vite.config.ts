import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    force: true,
  },
  plugins: [
    nodePolyfills(),
  ],
})
