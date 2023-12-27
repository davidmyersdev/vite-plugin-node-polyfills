import { describe, expect, it } from 'vitest'
import { formatWhitespace, transformDev } from '../../../test/utils'

describe('import globals', () => {
  describe('buffer', () => {
    it('injects Buffer', async () => {
      const result = await transformDev(`Buffer.from('test')`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        Buffer.from("test");
      `))
    })
  })

  describe('global', () => {
    it('injects global', async () => {
      const result = await transformDev(`console.log(global)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        console.log(global);
      `))
    })
  })

  describe('process', () => {
    it('injects process', async () => {
      const result = await transformDev(`console.log(process)`)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        console.log(process);
      `))
    })
  })
})
