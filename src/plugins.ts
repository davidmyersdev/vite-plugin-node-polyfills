import { fileURLToPath } from 'node:url'
import { type Plugin } from 'vite'
import { globals } from './globals'
import { type ModuleName } from './modules'
import * as regex from './regex'

export const buildShimResolver = (): Plugin[] => {
  const shimRegex = regex.compose([
    'vite-plugin-node-polyfills/shims/',
    regex.any(globals),
  ])

  const pluginPath = fileURLToPath(import.meta.url)

  return [
    {
      // Modules that cannot resolve this package, such as those in another
      // workspace or a strict package layout, get the shims from this
      // package's own location.
      name: 'vite-plugin-node-polyfills:shim-resolver',
      enforce: 'pre',
      resolveId: {
        // @ts-expect-error This property is only supported in Vite v6.3.0+, so
        // we must run the check inside the handler to maintain compatibility
        // with older Vite versions.
        filter: { id: shimRegex },
        async handler(source, importer, options) {
          if (!shimRegex.test(source)) {
            return
          }

          const resolvedFromImporter = await this.resolve(source, importer, {
            ...options,
            skipSelf: true,
          })

          if (resolvedFromImporter) {
            return resolvedFromImporter
          }

          return this.resolve(source, pluginPath, {
            ...options,
            skipSelf: true,
          })
        },
      },
    },
  ]
}

export const buildTrailingSlashNormalizer = ({
  modules,
  protocolImports,
}: {
  modules: ModuleName[],
  protocolImports: boolean,
}): Plugin[] => {
  const trailingSlashNormalizerRegex = regex.compose([
    regex.any([
      regex.join([
        regex.when(
          protocolImports,
          regex.optional('node:'),
        ),
        regex.any(modules),
      ]),
      regex.join([
        'vite-plugin-node-polyfills/shims/',
        regex.any(globals),
      ]),
    ]),
    '/',
  ])

  return [
    {
      // Vite v8.0.0+ does not support trailing slashes on package subpaths.
      name: 'vite-plugin-node-polyfills:trailing-slash-normalizer',
      enforce: 'pre',
      resolveId: {
        // @ts-expect-error This property is only supported in Vite v6.3.0+, so
        // we must run the check inside the handler to maintain compatibility
        // with older Vite versions.
        filter: { id: trailingSlashNormalizerRegex },
        async handler(source, importer, options) {
          if (!trailingSlashNormalizerRegex.test(source)) {
            return
          }

          const sourceWithoutTrailingSlash = source.replace(/\/$/, '')

          return this.resolve(sourceWithoutTrailingSlash, importer, {
            ...options,
            skipSelf: true,
          })
        },
      },
    },
  ]
}
