# vite-plugin-node-polyfills

A Vite plugin to polyfill native Node modules for the browser

## Getting Started

Install the package as a dev dependency.

```sh
# npm
npm install --save-dev vite-plugin-node-polyfills

# pnpm
pnpm install --save-dev vite-plugin-node-polyfills

# yarn
yarn add --dev vite-plugin-node-polyfills
```

Add the plugin to your `vite.config.ts` file.

```ts
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
  ],
})
```

## Attribution

Special thanks to [@FbN](https://github.com/FbN) for putting together [this gist](https://gist.github.com/FbN/0e651105937c8000f10fefdf9ec9af3d).
