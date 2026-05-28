import { describe, expect, it } from 'vitest'
import { formatWhitespace, transformDev } from '../../../test/utils'

describe('import globals', () => {
  describe('buffer', () => {
    it('injects Buffer', async () => {
      const result = await transformDev(`Buffer.from('test')`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as Buffer } from "/shims/buffer/dist/index.js";

        Buffer.from("test");
      `))
    })

    it('injects Buffer only', async () => {
      const result = await transformDev(`Buffer.from('test')`, {
        globals: {
          Buffer: true,
          global: false,
          process: false,
        },
      })

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as Buffer } from "/shims/buffer/dist/index.js";

        Buffer.from("test");
      `))
    })

    it('resolves to host globalThis.Buffer at runtime', async () => {
      const { default: shimBuffer } = await import('vite-plugin-node-polyfills/shims/buffer')

      expect(shimBuffer).toBe((globalThis as { Buffer?: typeof Buffer }).Buffer)
    })

    it('mutations to globalThis.Buffer are observed by the shim', async () => {
      const { default: shimBuffer } = await import('vite-plugin-node-polyfills/shims/buffer') as { default: Record<string, unknown> }
      const key = `__soft_fallback_test_${Date.now()}__`

      try {
        ;(globalThis as Record<string, Record<string, unknown>>).Buffer[key] = 'set-on-host'
        expect(shimBuffer[key]).toEqual('set-on-host')
      } finally {
        delete (globalThis as Record<string, Record<string, unknown>>).Buffer[key]
      }
    })
  })

  describe('global', () => {
    it('injects global', async () => {
      const result = await transformDev(`console.log(global)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as global } from "/shims/global/dist/index.js";

        console.log(global);
      `))
    })

    it('injects global only', async () => {
      const result = await transformDev(`console.log(global)`, {
        globals: {
          Buffer: false,
          global: true,
          process: false,
        },
      })

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as global } from "/shims/global/dist/index.js";

        console.log(global);
      `))
    })

    it('resolves to host globalThis.global at runtime', async () => {
      const { default: shimGlobal } = await import('vite-plugin-node-polyfills/shims/global')

      expect(shimGlobal).toBe((globalThis as { global?: typeof globalThis }).global)
    })

    it('mutations to globalThis.global are observed by the shim', async () => {
      const { default: shimGlobal } = await import('vite-plugin-node-polyfills/shims/global') as { default: Record<string, unknown> }
      const key = `__soft_fallback_test_${Date.now()}__`

      try {
        ;(globalThis as Record<string, Record<string, unknown>>).global[key] = 'set-on-host'
        expect(shimGlobal[key]).toEqual('set-on-host')
      } finally {
        delete (globalThis as Record<string, Record<string, unknown>>).global[key]
      }
    })
  })

  describe('process', () => {
    it('injects process', async () => {
      const result = await transformDev(`console.log(process)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as process } from "/shims/process/dist/index.js";

        console.log(process);
      `))
    })

    it('injects process only', async () => {
      const result = await transformDev(`console.log(process)`, {
        globals: {
          Buffer: false,
          global: false,
          process: true,
        },
      })

      expect(result?.code).toEqual(formatWhitespace(`
        import { default as process } from "/shims/process/dist/index.js";

        console.log(process);
      `))
    })

    it('resolves to host globalThis.process at runtime', async () => {
      const { default: shimProcess } = await import('vite-plugin-node-polyfills/shims/process')

      expect(shimProcess).toBe(globalThis.process)
    })

    it('mutations to globalThis.process are observed by the shim', async () => {
      const { default: shimProcess } = await import('vite-plugin-node-polyfills/shims/process') as { default: Record<string, unknown> }
      const key = `__soft_fallback_test_${Date.now()}__`

      try {
        ;(globalThis.process as Record<string, unknown>)[key] = 'set-on-host'
        expect(shimProcess[key]).toEqual('set-on-host')
      } finally {
        delete (globalThis.process as Record<string, unknown>)[key]
      }
    })
  })
})
