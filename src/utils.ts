import type stdLibBrowser from 'node-stdlib-browser'
import { type Plugin } from 'vite'

export type BuildTarget = 'build' | 'dev'
export type BooleanOrBuildTarget = boolean | BuildTarget
export type ModuleName = keyof typeof stdLibBrowser
export type ModuleNameWithoutNodePrefix<T = ModuleName> = T extends `node:${infer P}` ? P : never
export type TransformHook = Extract<Plugin['transform'], Function>

export const compareModuleNames = (moduleA: ModuleName, moduleB: ModuleName) => {
  return withoutNodeProtocol(moduleA) === withoutNodeProtocol(moduleB)
}

export const isEnabled = (value: BooleanOrBuildTarget, target: BuildTarget) => {
  if (!value) return false
  if (value === true) return true

  return value === target
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
