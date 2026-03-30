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
  })
})
