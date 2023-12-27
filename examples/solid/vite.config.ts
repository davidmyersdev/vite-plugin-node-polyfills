import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import solid from 'vite-plugin-solid'

export default defineConfig({
  optimizeDeps: {
    force: true,
  },
  plugins: [
    nodePolyfills({
      overrides: {
        'path/posix': 'path-browserify',
      },
    }),
    // comment/uncomment it:
    solid(),
  ],
})
