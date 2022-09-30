declare module 'node-stdlib-browser/helpers/esbuild/plugin' {
  import { Plugin } from 'esbuild'
  import stdLibBrowser from 'node-stdlib-browser'

  export default function(options: typeof stdLibBrowser): Plugin
}
