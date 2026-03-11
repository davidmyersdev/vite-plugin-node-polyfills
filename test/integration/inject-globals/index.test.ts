import { describe, expect, it } from 'vitest'
import { transformBuild } from '../../../test/utils'

describe('inject globals (build)', () => {
  describe('buffer', () => {
    it('injects Buffer shim when enabled', async () => {
      const code = await transformBuild(`Buffer.from('test')`, {
        globals: { Buffer: true, global: false, process: false },
      })

      expect(code).toContain('vite-plugin-node-polyfills/shims/buffer')
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
})
