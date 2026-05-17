export type ModuleName = typeof modules[number]
export type ModuleNameWithNodePrefix = `node:${ModuleName}`

export const modules = [
  '_stream_duplex',
  '_stream_passthrough',
  '_stream_readable',
  '_stream_transform',
  '_stream_writable',
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'module',
  'net',
  'os',
  'path',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'tty',
  'url',
  'util',
  'vm',
  'zlib',
] as const

export const getModulesToPolyfill = ({
  modulesToExclude,
  modulesToInclude,
}: {
  modulesToExclude: ModuleName[],
  modulesToInclude: ModuleName[],
}): ModuleName[] => {
  return modules.filter((module) => {
    if (modulesToInclude.length > 0) {
      return modulesToInclude.includes(module)
    }

    return !modulesToExclude.includes(module)
  })
}

export const isModuleName = (name: string): name is ModuleName => {
  return modules.includes(name as ModuleName)
}
