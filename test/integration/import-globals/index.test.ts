import { describe, expect, it } from 'vitest'
import { formatWhitespace, transformDev } from '../../../test/utils'

describe('import globals', () => {
  describe('buffer', () => {
    it('resolves normally', async () => {
      const result = await transformDev(`
        import Buffer from 'buffer'
        console.log(Buffer)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import Buffer from "/shims/buffer/dist/index.js";
        console.log(Buffer);
      `))
    })

    it('resolves with a `node:` prefix', async () => {
      const result = await transformDev(`
        import Buffer from 'node:buffer'
        console.log(Buffer)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import Buffer from "/shims/buffer/dist/index.js";
        console.log(Buffer);
      `))
    })

    it('resolves with a trailing slash', async () => {
      const result = await transformDev(`
        import Buffer from 'buffer/'
        console.log(Buffer)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import Buffer from "/shims/buffer/dist/index.js";
        console.log(Buffer);
      `))
    })

    it('resolves with a `node:` prefix and a trailing slash', async () => {
      const result = await transformDev(`
        import Buffer from 'node:buffer/'
        console.log(Buffer)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import Buffer from "/shims/buffer/dist/index.js";
        console.log(Buffer);
      `))
    })
  })

  describe('process', () => {
    it('resolves normally', async () => {
      const result = await transformDev(`
        import process from 'process'
        console.log(process)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import process from "/shims/process/dist/index.js";
        console.log(process);
      `))
    })

    it('resolves with a `node:` prefix', async () => {
      const result = await transformDev(`
        import process from 'node:process'
        console.log(process)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import process from "/shims/process/dist/index.js";
        console.log(process);
      `))
    })

    it('resolves with a trailing slash', async () => {
      const result = await transformDev(`
        import process from 'process/'
        console.log(process)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import process from "/shims/process/dist/index.js";
        console.log(process);
      `))
    })

    it('resolves with a `node:` prefix and a trailing slash', async () => {
      const result = await transformDev(`
        import process from 'node:process/'
        console.log(process)
      `)

      expect(result?.code).toEqual(formatWhitespace(`
        import __buffer_polyfill from "/shims/buffer/dist/index.js"
        import __global_polyfill from "/shims/global/dist/index.js"
        import __process_polyfill from "/shims/process/dist/index.js"

        globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
        globalThis.global = globalThis.global || __global_polyfill
        globalThis.process = globalThis.process || __process_polyfill

        import process from "/shims/process/dist/index.js";
        console.log(process);
      `))
    })
  })
})
