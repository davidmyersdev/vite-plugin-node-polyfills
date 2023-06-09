import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from '../src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
