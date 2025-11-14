import { createRequire } from 'node:module'
import inject from '@rollup/plugin-inject'
import stdLibBrowser from 'node-stdlib-browser'
import { handleCircularDependancyWarning } from 'node-stdlib-browser/helpers/rollup/plugin'
import esbuildPlugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import type { Plugin } from 'vite'
import { compareModuleNames, isEnabled, isNodeProtocolImport, toRegExp, withoutNodeProtocol } from './utils'

export type BuildTarget = 'build' | 'dev'
export type BooleanOrBuildTarget = boolean | BuildTarget
export type ModuleName = keyof typeof stdLibBrowser
export type ModuleNameWithoutNodePrefix<T = ModuleName> = T extends `node:${infer P}` ? P : never

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
  include?: ModuleNameWithoutNodePrefix[],
  /**
   * @example
   *
   * ```ts
   * nodePolyfills({
   *   exclude: ['fs', 'path'],
   * })
   * ```
   */
  exclude?: ModuleNameWithoutNodePrefix[],
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
  overrides?: { [Key in ModuleNameWithoutNodePrefix]?: string },
  /**
   * Specify whether the Node protocol version of an import (e.g. `node:buffer`) should be polyfilled too.
   *
   * @default true
   */
  protocolImports?: boolean,
}

export type PolyfillOptionsResolved = {
  include: ModuleNameWithoutNodePrefix[],
  exclude: ModuleNameWithoutNodePrefix[],
  globals: {
    Buffer: BooleanOrBuildTarget,
    global: BooleanOrBuildTarget,
    process: BooleanOrBuildTarget,
  },
  overrides: { [Key in ModuleNameWithoutNodePrefix]?: string },
  protocolImports: boolean,
}

const globalShimBanners = {
  buffer: [
    `import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'`,
    `globalThis.Buffer = globalThis.Buffer || __buffer_polyfill`,
  ],
  global: [
    `import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'`,
    `globalThis.global = globalThis.global || __global_polyfill`,
  ],
  process: [
    `import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'`,
    `globalThis.process = globalThis.process || __process_polyfill`,
  ],
}

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

  const toOverride = (name: ModuleNameWithoutNodePrefix): string | void => {
    if (isEnabled(optionsResolved.globals.Buffer, 'dev') && /^buffer$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/buffer'
    }

    if (isEnabled(optionsResolved.globals.global, 'dev') && /^global$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/global'
    }

    if (isEnabled(optionsResolved.globals.process, 'dev') && /^process$/.test(name)) {
      return 'vite-plugin-node-polyfills/shims/process'
    }

    if (name in optionsResolved.overrides) {
      return optionsResolved.overrides[name]
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

  const require = createRequire(import.meta.url)
  const globalShimPaths = [
    ...((isEnabled(optionsResolved.globals.Buffer, 'dev')) ? [require.resolve('vite-plugin-node-polyfills/shims/buffer')] : []),
    ...((isEnabled(optionsResolved.globals.global, 'dev')) ? [require.resolve('vite-plugin-node-polyfills/shims/global')] : []),
    ...((isEnabled(optionsResolved.globals.process, 'dev')) ? [require.resolve('vite-plugin-node-polyfills/shims/process')] : []),
  ]

  const globalShimsBanner = [
    ...((isEnabled(optionsResolved.globals.Buffer, 'dev')) ? globalShimBanners.buffer : []),
    ...((isEnabled(optionsResolved.globals.global, 'dev')) ? globalShimBanners.global : []),
    ...((isEnabled(optionsResolved.globals.process, 'dev')) ? globalShimBanners.process : []),
    ``,
  ].join('\n')

  return {
    name: 'vite-plugin-node-polyfills',
    config(config, env) {
      const isDev = env.command === 'serve'
      // @ts-expect-error - this.meta.rolldownVersion only exists with rolldown-vite 7+
      const isRolldownVite = !!this?.meta?.rolldownVersion

      // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L203-L209
      const defines = {
        ...((isDev && isEnabled(optionsResolved.globals.Buffer, 'dev')) ? { Buffer: 'Buffer' } : {}),
        ...((isDev && isEnabled(optionsResolved.globals.global, 'dev')) ? { global: 'global' } : {}),
        ...((isDev && isEnabled(optionsResolved.globals.process, 'dev')) ? { process: 'process' } : {}),
      }

      const shimsToInject = {
        // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md#vite
        ...(isEnabled(optionsResolved.globals.Buffer, 'build') ? { Buffer: 'vite-plugin-node-polyfills/shims/buffer' } : {}),
        ...(isEnabled(optionsResolved.globals.global, 'build') ? { global: 'vite-plugin-node-polyfills/shims/global' } : {}),
        ...(isEnabled(optionsResolved.globals.process, 'build') ? { process: 'vite-plugin-node-polyfills/shims/process' } : {}),
      }

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
            ...Object.keys(shimsToInject).length > 0
              ? isRolldownVite
                ? { transform: { inject: shimsToInject } }
                : { plugins: [inject(shimsToInject)] }
              : {},
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
          ...isRolldownVite
            ? {
                rolldownOptions: {
                  resolve: {
                    // https://github.com/niksy/node-stdlib-browser/blob/3e7cd7f3d115ac5c4593b550e7d8c4a82a0d4ac4/README.md?plain=1#L150
                    alias: {
                      ...polyfills,
                    },
                  },
                  transform: {
                    define: defines,
                  },
                  plugins: [
                    {
                      name: 'vite-plugin-node-polyfills:optimizer',
                      banner: isDev ? globalShimsBanner : undefined,
                    },
                  ],
                },
              }
            : {
                esbuildOptions: {
                  banner: isDev ? { js: globalShimsBanner } : undefined,
                  define: defines,
                  inject: [
                    ...globalShimPaths,
                  ],
                  plugins: [
                    esbuildPlugin(polyfills),
                    // Supress the 'injected path "..." cannot be marked as external' error in Vite 4 (emitted by esbuild).
                    // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1469
                    {
                      name: 'vite-plugin-node-polyfills-shims-resolver',
                      setup(build) {
                        for (const globalShimPath of globalShimPaths) {
                          const globalShimsFilter = toRegExp(globalShimPath)

                          // https://esbuild.github.io/plugins/#on-resolve
                          build.onResolve({ filter: globalShimsFilter }, () => {
                            return {
                              // https://github.com/evanw/esbuild/blob/edede3c49ad6adddc6ea5b3c78c6ea7507e03020/internal/bundler/bundler.go#L1468
                              external: false,
                              path: globalShimPath,
                            }
                          })
                        }
                      },
                    },
                  ],
                },
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
  }
}
