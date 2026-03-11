import { build, createServer } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * Format code by removing the smallest indentation from each line.
 */
export const formatWhitespace = (code: string) => {
  const lines = code.split('\n')
  const smallestIndentation = lines.reduce((currentIndentation, line) => {
    if (line.trim() === '') {
      return currentIndentation
    }

    const lineIndentation = line.match(/^\s*/)?.at(0)?.length ?? 0

    if (currentIndentation < 0) {
      return lineIndentation
    }

    return Math.min(currentIndentation, lineIndentation)
  }, -1)

  const formatted = lines.map((line) => line.slice(smallestIndentation)).join('\n').trim()

  return `${formatted}\n`
}

export const transformBuild = async (code: string, options?: PolyfillOptions) => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      nodePolyfills(options),
      {
        name: 'test-code-loader',
        resolveId(id) {
          if (id === 'virtual:test.ts') return id
        },
        load(id) {
          if (id === 'virtual:test.ts') return code
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: 'virtual:test.ts',
        external: [
          'vite-plugin-node-polyfills/shims/buffer',
          'vite-plugin-node-polyfills/shims/global',
          'vite-plugin-node-polyfills/shims/process',
        ],
      },
    },
  })

  const output = Array.isArray(result) ? result[0] : result

  return output.output[0].code
}

export const transformDev = async (code: string, options?: PolyfillOptions) => {
  const server = await createServer({
    configFile: false,
    esbuild: {
      format: 'esm',
    },
    plugins: [
      nodePolyfills(options),
      {
        name: 'test-code-loader',
        load(id) {
          if (id === 'virtual:test.ts') {
            return code
          }
        },
      },
    ],
  })

  try {
    return await server.transformRequest('virtual:test.ts')
  } finally {
    await server.close()
  }
}
