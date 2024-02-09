import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default {
  optimizeDeps: {
    force: true,
  },
  plugins: [
    nodePolyfills(),
  ],
}
