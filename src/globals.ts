import {
  type BooleanOrBuildTarget,
  type BuildTarget,
  isEnabled,
} from './utils'

export type GlobalName = typeof globals[number]

export const globals = [
  'buffer',
  'global',
  'process',
] as const

export const getGlobalsToHandle = (options: {
  globals: { [Name in GlobalName]: BooleanOrBuildTarget },
  target: BuildTarget,
}): GlobalName[] => {
  return globals.filter((global) => {
    const value = options.globals[global]

    return isEnabled(value, options.target)
  })
}
