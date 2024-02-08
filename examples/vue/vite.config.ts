import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    minify: false,
  },
  plugins: [
    nodePolyfills(),
    vue(),
  ],
})
