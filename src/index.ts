import inject from '@rollup/plugin-inject'
import browserResolve from 'browser-resolve'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'
import { compareModuleNames, isEnabled, isNodeProtocolImport, resolvePolyfill, toEntries, toRegExp, withoutNodeProtocol } from './utils'

export type BareModuleName<T = ModuleName> = T extends `node:${infer P}` ? P : never
export type BareModuleNameWithSubpath<T = ModuleName> = T extends `node:${infer P}` ? `${P}/${string}` : never
export type BooleanOrBuildTarget = boolean | BuildTarget
export type BuildTarget = 'build' | 'dev'
export type ModuleName = keyof typeof stdLibBrowser
export type OverrideOptions = {

}

export type PolyfillOptions = {
  /**
   * Includes specific modules. If empty, includes all modules
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   include: ['fs', 'path'],
   * })
   * ```
  */
  include?: BareModuleName[],
  /**
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   exclude: ['fs', 'path'],
   * })
   * ```
   */
  exclude?: BareModuleName[],
  /**
   * Specify whether specific globals should be polyfilled.
   *
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   globals: {
   *     Buffer: false,
   *     global: true,
   *     process: 'build',
   *   },
   * })
   * ```
   */
  globals?: {
    Buffer?: BooleanOrBuildTarget,
    global?: BooleanOrBuildTarget,
    process?: BooleanOrBuildTarget,
  },
  /**
   * Specify alternative modules to use in place of the default polyfills.
   *
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   overrides: {
   *     fs: 'memfs',
   *   },
   * })
   * ```
   */
  overrides?: { [Key in BareModuleName | BareModuleNameWithSubpath]?: string },
  /**
   * Specify whether the Node protocol version of an import (e.g. `node:buffer`) should be polyfilled too.
   *
   * @default true
   */
  protocolImports?: boolean,
}

export type PolyfillOptionsResolved = {
  include: BareModuleName[],
  exclude: BareModuleName[],
  globals: {
    Buffer: BooleanOrBuildTarget,
    global: BooleanOrBuildTarget,
    process: BooleanOrBuildTarget,
  },
  overrides: { [Key in BareModuleName | BareModuleNameWithSubpath]?: string },
  protocolImports: boolean,
}

const globalShimsBanner = [
  `import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'`,
  `import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'`,
  `import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'`,
  ``,
  `globalThis.Buffer = globalThis.Buffer || __buffer_polyfill`,
  `globalThis.global = globalThis.global || __global_polyfill`,
  `globalThis.process = globalThis.process || __process_polyfill`,
  ``,
].join('\n')

/**
 * Returns a Vite plugin to polyfill Node's Core Modules for browser environments. Supports `node:` protocol imports.
 *
 * @example
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import { nodePolyfills } from 'vite-plugin-node-polyfills'
 *
 * export default defineConfig({
 *   plugins: [
 *     nodePolyfills({
 *       // Specific modules that should not be polyfilled.
 *       exclude: [],
 *       // Whether to polyfill specific globals.
 *       globals: {
 *         Buffer: true, // can also be 'build', 'dev', or false
 *         global: true,
 *         process: true,
 *       },
 *       // Whether to polyfill `node:` protocol imports.
 *       protocolImports: true,
 *     }),
 *   ],
 * })
 * ```
 */
export const nodePolyfills = (options: PolyfillOptions = {}): Plugin => {
  const globalShimPaths = [
    'vite-plugin-node-polyfills/shims/buffer',
    'vite-plugin-node-polyfills/shims/global',
    'vite-plugin-node-polyfills/shims/process',
  ]
  const optionsResolved: PolyfillOptionsResolved = {
    include: [],
    exclude: [],
    overrides: {},
    protocolImports: true,
    ...options,
    globals: {
      Buffer: true,
      global: true,
      process: true,
      ...options.globals,
    },
  }

  const isExcluded = (moduleName: ModuleName) => {
    if (optionsResolved.include.length > 0) {
      return !optionsResolved.include.some((includedName) => compareModuleNames(moduleName, includedName))
    }

    return optionsResolved.exclude.some((excludedName) => compareModuleNames(moduleName, excludedName))
  }

  const toOverride = (name: BareModuleName): string | void => {
    if (name in optionsResolved.overrides) {
      return optionsResolved.overrides[name]
    }

    if (/^buffer$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/buffer'
    }

    if (/^global$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/global'
    }

    if (/^process$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/process'
    }
  }

  const polyfills = (Object.entries(stdLibBrowser) as Array<[ModuleName, string]>).reduce<Record<ModuleName, string>>((included, [name, value]) => {
    if (!optionsResolved.protocolImports) {
      if (isNodeProtocolImport(name)) {
        return included
      }
    }

    if (!isExcluded(name)) {
      included[name] = toOverride(withoutNodeProtocol(name)) || value
    }

    return included
  }, {} as Record<ModuleName, string>)

  return {
    name: 'vite-plugin-node-polyfills',
    enforce: 'pre',
    config: (config, env) => {
      const isDev = env.command === 'serve'

      return {
        build: {
          rollupOptions: {
            onwarn: (warning, rollupWarn) => {
              handleCircularDependancyWarning(warning, () => {
                if (config.build?.rollupOptions?.onwarn) {
                  return config.build.rollupOptions.onwarn(warning, rollupWarn)
                }

                rollupWarn(warning)
              })
            },
            plugins: [
              {
                ...inject({
                  // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md#vite
                  ...(isEnabled(optionsResolved.globals.Buffer, 'build') ? { Buffer: 'vite-plugin-node-polyfills/shims/buffer' } : {}),
                  ...(isEnabled(optionsResolved.globals.global, 'build') ? { global: 'vite-plugin-node-polyfills/shims/global' } : {}),
                  ...(isEnabled(optionsResolved.globals.process, 'build') ? { process: 'vite-plugin-node-polyfills/shims/process' } : {}),
                }),
              },
            ],
          },
        },
        esbuild: {
          // In dev, the global polyfills need to be injected as a banner in order for isolated scripts (such as Vue SFCs) to have access to them.
          banner: isDev ? globalShimsBanner : undefined,
        },
        optimizeDeps: {
          exclude: [
            ...globalShimPaths,
          ],
          esbuildOptions: {
            banner: isDev ? { js: globalShimsBanner } : undefined,
            // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L203-L209
            define: {
              ...((isDev && isEnabled(optionsResolved.globals.Buffer, 'dev')) ? { Buffer: 'Buffer' } : {}),
              ...((isDev && isEnabled(optionsResolved.globals.global, 'dev')) ? { global: 'global' } : {}),
              ...((isDev && isEnabled(optionsResolved.globals.process, 'dev')) ? { process: 'process' } : {}),
            },
            inject: [
              ...globalShimPaths,
            ],
            plugins: [
              esbuildPlugin({
                ...polyfills,
              }),
              // Supress the 'injected path "..." cannot be marked as external' error in Vite 4 (emitted by esbuild).
              // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1469
              {
                name: 'vite-plugin-node-polyfills-shims-resolver',
                setup: (build) => {
                  for (const globalShimPath of globalShimPaths) {
                    const globalShimsFilter = toRegExp(globalShimPath)

                    // https://esbuild.github.io/plugins/#on-resolve
                    build.onResolve({ filter: globalShimsFilter }, () => {
                      const resolved = browserResolve.sync(globalShimPath)

                      return {
                        // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1468
                        external: false,
                        path: resolved,
                      }
                    })
                  }
                },
              },
            ],
          },
        },
        resolve: {
          // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L150
          alias: {
            ...polyfills,
          },
        },
      }
    },
    async resolveId(id) {
      for (const [moduleName, modulePath] of toEntries(polyfills)) {
        if (id.startsWith(modulePath)) {
          // Grab the subpath without the forward slash. E.g. `path/posix` -> `posix`
          const moduleSubpath = id.slice(modulePath.length + 1)

          if (moduleSubpath.length > 0) {
            const moduleNameWithoutProtocol = withoutNodeProtocol(moduleName)
            const overrideName = `${moduleNameWithoutProtocol}/${moduleSubpath}` as const
            const override = optionsResolved.overrides[overrideName]

            if (!override) {
              // Todo: Maybe throw error?
              return undefined
            }

            return await resolvePolyfill(this, override)
          }

          return browserResolve.sync(modulePath)
        }
      }
    },
  }
}
