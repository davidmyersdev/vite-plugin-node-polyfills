import { describe, expect, it } from 'vitest'
import { formatWhitespace, transformDev } from '../../../test/utils'

describe('import globals', () => {
  describe('buffer', () => {
    it('injects Buffer', async () => {
      const result = await transformDev(`Buffer.from('test')`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        import __global_polyfill from "/shims/global/dist/index.js"
        globalThis.global = globalThis.global || __global_polyfill
        import __process_polyfill from "/shims/process/dist/index.js"
        globalThis.process = globalThis.process || __process_polyfill

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
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill

        Buffer.from("test");
      `))
    })
  })

  describe('global', () => {
    it('injects global', async () => {
      const result = await transformDev(`console.log(global)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        import __global_polyfill from "/shims/global/dist/index.js"
        globalThis.global = globalThis.global || __global_polyfill
        import __process_polyfill from "/shims/process/dist/index.js"
        globalThis.process = globalThis.process || __process_polyfill

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
        import __global_polyfill from "/shims/global/dist/index.js"
        globalThis.global = globalThis.global || __global_polyfill

        console.log(global);
      `))
    })
  })

  describe('process', () => {
    it('injects process', async () => {
      const result = await transformDev(`console.log(process)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        import __global_polyfill from "/shims/global/dist/index.js"
        globalThis.global = globalThis.global || __global_polyfill
        import __process_polyfill from "/shims/process/dist/index.js"
        globalThis.process = globalThis.process || __process_polyfill

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
        import __process_polyfill from "/shims/process/dist/index.js"
        globalThis.process = globalThis.process || __process_polyfill

        console.log(process);
      `))
    })
  })
})
