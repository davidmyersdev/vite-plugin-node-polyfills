import type { PluginContext } from 'rollup'
import type { BareModuleName, BooleanOrBuildTarget, ModuleName } from './index'

export type Identity<T> = T
export type ObjectToEntries<T> = Identity<{ [K in keyof T]: [K, T[K]] }[keyof T][]>

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

export const resolvePolyfill = async (context: PluginContext, name: string) => {
  const consumerResolved = await context.resolve(name)

  if (consumerResolved) {
    return consumerResolved
  }

  const provider = await context.resolve('vite-plugin-node-polyfills')
  const providerResolved = await context.resolve(name, provider!.id)

  if (providerResolved) {
    return providerResolved
  }

  const upstream = await context.resolve('node-stdlib-browser', provider!.id)
  const upstreamResolved = await context.resolve(name, upstream!.id)

  return upstreamResolved
}

export const toEntries = <T extends Record<PropertyKey, unknown>>(object: T): ObjectToEntries<T> => {
  return Object.entries(object) as ObjectToEntries<T>
}

export const toRegExp = (text: string) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return new RegExp(`^${escapedText}$`)
}

export const withoutNodeProtocol = (name: ModuleName): BareModuleName => {
  return name.replace(/^node:/, '') as BareModuleName
}
