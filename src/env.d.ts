declare module 'node-stdlib-browser/helpers/esbuild/plugin' {
  import { Plugin } from 'esbuild'
  import stdLibBrowser from 'node-stdlib-browser'

  export default function(options: typeof stdLibBrowser): Plugin
}

declare module 'node-stdlib-browser/helpers/rollup/plugin' {
  import type { WarningHandlerWithDefault } from 'rollup'

  export const handleCircularDependancyWarning: WarningHandlerWithDefault
}
