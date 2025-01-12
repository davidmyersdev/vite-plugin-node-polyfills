import { nodePolyfills } from 'vite-plugin-node-polyfill'

export default {
  optimizeDeps: {
    force: true,
  },
  plugins: [
    nodePolyfills(),
  ],
}
