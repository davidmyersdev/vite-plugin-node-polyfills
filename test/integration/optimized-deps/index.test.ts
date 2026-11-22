import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { describe, expect, it } from 'vitest'

const globals = `export const values = [Buffer.from('test').toString(), typeof global, process.browser]`

const createFixture = async (cacheDir?: string, options?: PolyfillOptions) => {
  const root = await mkdtemp(resolve('node_modules/.polyfills-test-'))
  await writeFile(resolve(root, 'package.json'), JSON.stringify({ type: 'module' }))
  for (const name of ['test-dependency', 'excluded-dependency']) {
    await mkdir(resolve(root, 'node_modules', name), { recursive: true })
    await writeFile(resolve(root, 'node_modules', name, 'package.json'), JSON.stringify({ name, main: 'index.js', type: 'module' }))
    await writeFile(resolve(root, 'node_modules', name, 'index.js'), globals)
  }
  await writeFile(resolve(root, 'main.js'), `import 'test-dependency'; import 'excluded-dependency'; ${globals}`)
  const server = await createServer({
    root,
    cacheDir,
    configFile: false,
    optimizeDeps: { entries: [], include: ['test-dependency'], exclude: ['excluded-dependency'] },
    plugins: [nodePolyfills(options)],
    server: { host: '127.0.0.1', port: 0 },
  })
  await server.listen()

  return {
    server,
    async close() {
      await server.close()
      await rm(root, { recursive: true, force: true })
    },
  }
}

const getDependencyResponse = async (server: Awaited<ReturnType<typeof createServer>>) => {
  const entry = await server.transformRequest('/main.js')
  const dependencyUrl = entry!.code.match(/["']([^"']*\/deps\/test-dependency\.js\?v=[^"']+)["']/)![1]
  const address = server.httpServer!.address()
  if (!address || typeof address === 'string') throw new Error('Expected an HTTP server address')
  const response = await fetch(`http://127.0.0.1:${address.port}${dependencyUrl}`)
  expect(response.status).toBe(200)

  return response.text()
}

describe('optimized dependencies', () => {
  it.each([undefined, 'custom-cache'])('preserves external sourcemaps with cacheDir %s', async (cacheDir) => {
    const fixture = await createFixture(cacheDir)
    try {
      const code = await getDependencyResponse(fixture.server)
      expect(code).toContain('sourceMappingURL=test-dependency.js.map')
      expect(code).not.toContain('sourceMappingURL=data:')
      expect(await getDependencyResponse(fixture.server)).toEqual(code)

      for (const url of ['/main.js', '/node_modules/excluded-dependency/index.js']) {
        const result = await fixture.server.transformRequest(url)
        expect(result!.code).toContain('default as Buffer')
        expect(result!.code).toContain('default as global')
        expect(result!.code).toContain('default as process')
        expect(result!.map?.mappings).toBeTruthy()
      }
    } finally {
      await fixture.close()
    }
  })

  it.each(['Buffer', 'global', 'process'] as const)('retains injection for the build-only %s option', async (name) => {
    const fixture = await createFixture(undefined, { globals: { [name]: 'build' } })
    try {
      const code = await getDependencyResponse(fixture.server)
      expect(code).toContain(`default as ${name}`)
    } finally {
      await fixture.close()
    }
  })
})
