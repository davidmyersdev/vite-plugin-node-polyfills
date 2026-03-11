import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { transformBuild } from '../../../test/utils'

describe('inject globals (build)', () => {
  describe('buffer', () => {
    it('injects Buffer shim when enabled', async () => {
      const code = await transformBuild(`Buffer.from('test')`, {
        globals: { Buffer: true, global: false, process: false },
      })

      expect(code).toContain('vite-plugin-node-polyfills/shims/buffer')
    })

    it('injects Buffer as a named import', async () => {
      const code = await transformBuild(`Buffer.from('test')`, {
        globals: { Buffer: true, global: false, process: false },
      })

      expect(code).toMatch(/import\s*\{\s*Buffer\s*\}\s*from\s*["']/)
      expect(code).not.toMatch(/import\s+Buffer\s+from\s*["']/)
    })

    it('does not inject Buffer shim when disabled', async () => {
      const code = await transformBuild(`console.log('no buffer')`, {
        globals: { Buffer: false, global: false, process: false },
      })

      expect(code).not.toContain('vite-plugin-node-polyfills/shims/buffer')
    })
  })

  describe('global', () => {
    it('injects global shim when enabled', async () => {
      const code = await transformBuild(`console.log(global)`, {
        globals: { Buffer: false, global: true, process: false },
      })

      expect(code).toContain('vite-plugin-node-polyfills/shims/global')
    })

    it('injects global as a named import', async () => {
      const code = await transformBuild(`console.log(global)`, {
        globals: { Buffer: false, global: true, process: false },
      })

      expect(code).toMatch(/import\s*\{\s*global\s*\}\s*from\s*["']/)
      expect(code).not.toMatch(/import\s+global\s+from\s*["']/)
    })

    it('does not inject global shim when disabled', async () => {
      const code = await transformBuild(`console.log('no global')`, {
        globals: { Buffer: false, global: false, process: false },
      })

      expect(code).not.toContain('vite-plugin-node-polyfills/shims/global')
    })
  })

  describe('process', () => {
    it('injects process shim when enabled', async () => {
      const code = await transformBuild(`console.log(process.cwd())`, {
        globals: { Buffer: false, global: false, process: true },
      })

      expect(code).toContain('vite-plugin-node-polyfills/shims/process')
    })

    it('injects process as a named import', async () => {
      const code = await transformBuild(`console.log(process.cwd())`, {
        globals: { Buffer: false, global: false, process: true },
      })

      expect(code).toMatch(/import\s*\{\s*process\s*\}\s*from\s*["']/)
      expect(code).not.toMatch(/import\s+process\s+from\s*["']/)
    })

    it('does not inject process shim when disabled', async () => {
      const code = await transformBuild(`console.log('no process')`, {
        globals: { Buffer: false, global: false, process: false },
      })

      expect(code).not.toContain('vite-plugin-node-polyfills/shims/process')
    })
  })

  it('injects all globals with default config', async () => {
    const code = await transformBuild(`Buffer.from('test'); console.log(global); console.log(process.cwd())`)

    expect(code).toContain('vite-plugin-node-polyfills/shims/buffer')
    expect(code).toContain('vite-plugin-node-polyfills/shims/global')
    expect(code).toContain('vite-plugin-node-polyfills/shims/process')
  })

  it('injects all globals as named imports with default config', async () => {
    const code = await transformBuild(`Buffer.from('test'); console.log(global); console.log(process.cwd())`)

    expect(code).toMatch(/import\s*\{\s*Buffer\s*\}\s*from\s*["']/)
    expect(code).toMatch(/import\s*\{\s*global\s*\}\s*from\s*["']/)
    expect(code).toMatch(/import\s*\{\s*process\s*\}\s*from\s*["']/)
    expect(code).not.toMatch(/import\s+Buffer\s+from\s*["']/)
    expect(code).not.toMatch(/import\s+global\s+from\s*["']/)
    expect(code).not.toMatch(/import\s+process\s+from\s*["']/)
  })

  it('Buffer.from works when shim resolves to node:buffer', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        nodePolyfills({ globals: { Buffer: true, global: false, process: false } }),
        {
          name: 'test-ssr-redirect',
          enforce: 'pre',
          resolveId(id) {
            if (id === 'virtual:test.ts') return id
            if (id === 'vite-plugin-node-polyfills/shims/buffer') return { id: 'node:buffer', external: true }
          },
          load(id) {
            if (id === 'virtual:test.ts') return `export const result = typeof Buffer.from`
          },
        },
      ],
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: 'virtual:test.ts',
          preserveEntrySignatures: 'exports-only',
        },
      },
    })

    const output = Array.isArray(result) ? result[0] : result
    const code = output.output[0].code
    const mod = await import(`data:text/javascript,${encodeURIComponent(code)}`)

    expect(mod.result).toBe('function')
  })
})
