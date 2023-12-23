import type { BooleanOrBuildTarget, ModuleName, ModuleNameWithoutNodePrefix } from './index'

export const compareModuleNames = (moduleA: ModuleName, moduleB: ModuleName) => {
  return withoutNodeProtocol(moduleA) === withoutNodeProtocol(moduleB)
}

export const isEnabled = (value: BooleanOrBuildTarget, mode: 'build' | 'dev') => {
  if (!value) return false
  if (value === true) return true

  return value === mode
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
