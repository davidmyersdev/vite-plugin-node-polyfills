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

## Why?

The following error can occur when a package references a native Node module without providing a polyfill. See [this Vite issue](https://github.com/vitejs/vite/issues/9200) for more info.

```
Module "stream" has been externalized for browser compatibility. Cannot access "stream.Readable" in client code.
```

## Attribution

Special thanks to [@FbN](https://github.com/FbN) for putting together [this gist](https://gist.github.com/FbN/0e651105937c8000f10fefdf9ec9af3d).
