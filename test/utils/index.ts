import { createServer } from 'vite'
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
