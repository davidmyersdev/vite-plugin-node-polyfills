import stdLibBrowser from 'node-stdlib-browser'
import { type Plugin } from 'vite'

export type BuildTarget = 'build' | 'dev'
export type BooleanOrBuildTarget = boolean | BuildTarget
export type ModuleName = keyof typeof stdLibBrowser
export type ModuleNameWithoutNodePrefix<T = ModuleName> = T extends `node:${infer P}` ? P : never
export type TransformHook = Extract<Plugin['transform'], Function>

export const compareModuleNames = (moduleA: ModuleName, moduleB: ModuleName) => {
  return withoutNodeProtocol(moduleA) === withoutNodeProtocol(moduleB)
}

export const globalShimBanners = {
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

export const isEnabled = (value: BooleanOrBuildTarget, target: BuildTarget) => {
  if (!value) return false
  if (value === true) return true

  return value === target
}

export const isModuleName = (name: string): name is ModuleName => {
  return name in stdLibBrowser
}

export const isNodeProtocolImport = (name: string) => {
  return name.startsWith('node:')
}

export const toRegExp = (text: string) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return new RegExp(`^${escapedText}$`)
}

export const withoutNodeProtocol = (name: ModuleName): ModuleNameWithoutNodePrefix => {
  return name.replace(/^node:/, '') as ModuleNameWithoutNodePrefix
}
