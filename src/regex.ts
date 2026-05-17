export const any = (patterns: readonly string[]) => {
  return group(patterns.join('|'))
}

export const compose = (patterns: readonly string[]) => {
  const pattern = patterns.join('')

  return new RegExp(`^${pattern}$`)
}

export const group = (pattern: string) => {
  return `(?:${pattern})`
}

export const join = (patterns: readonly string[]) => {
  return patterns.join('')
}

export const optional = (pattern: string) => {
  return `${group(pattern)}?`
}

export const when = (condition: boolean, pattern: string, fallback = '') => {
  if (condition) {
    return pattern
  }

  return fallback
}
