import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { RollupOutput } from 'rollup'
import { build, createServer } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { formatWhitespace } from '../../../test/utils'

// Modules in a temporary directory have no `node_modules` above them, so they cannot resolve this plugin themselves.
describe('unresolvable importers', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'vite-plugin-node-polyfills-'))
  })

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true })
  })

  describe('dev', () => {
    it('injects Buffer', async () => {
      const result = await transformDev(`Buffer.from('test')`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as Buffer } from "/shims/buffer/dist/index.js";

        Buffer.from("test");
      `))
    })

    it('injects global', async () => {
      const result = await transformDev(`console.log(global)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as global } from "/shims/global/dist/index.js";

        console.log(global);
      `))
    })

    it('injects process', async () => {
      const result = await transformDev(`console.log(process)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as process } from "/shims/process/dist/index.js";

        console.log(process);
      `))
    })
  })

  describe('build', () => {
    it('bundles the Buffer shim', async () => {
      const moduleIds = await buildModuleIds(`Buffer.from('test')`)

      expect(moduleIds).toContain(resolve('shims/buffer/dist/index.js'))
    })

    it('bundles the global shim', async () => {
      const moduleIds = await buildModuleIds(`console.log(global)`)

      expect(moduleIds).toContain(resolve('shims/global/dist/index.js'))
    })

    it('bundles the process shim', async () => {
      const moduleIds = await buildModuleIds(`console.log(process)`)

      expect(moduleIds).toContain(resolve('shims/process/dist/index.js'))
    })
  })

  const writeEntry = async (code: string) => {
    const entry = join(directory, 'index.ts')

    await writeFile(entry, code)

    return entry
  }

  const transformDev = async (code: string) => {
    const entry = await writeEntry(code)
    const server = await createServer({
      configFile: false,
      esbuild: {
        format: 'esm',
      },
      plugins: [
        nodePolyfills(),
      ],
      server: {
        fs: {
          strict: false,
        },
      },
    })

    try {
      return await server.transformRequest(`/@fs${entry}`)
    } finally {
      await server.close()
    }
  }

  const buildModuleIds = async (code: string) => {
    const entry = await writeEntry(code)
    const output = await build({
      build: {
        rollupOptions: {
          input: entry,
        },
        write: false,
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        nodePolyfills(),
      ],
      root: directory,
    }) as RollupOutput

    return output.output[0].moduleIds
  }
})
