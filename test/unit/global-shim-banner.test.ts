import { describe, expect, it } from 'vitest'
import { globalShimBanners } from '../../src/utils'

describe('globalShimBanners', () => {
  it('terminates every statement with a semicolon', () => {
    for (const lines of Object.values(globalShimBanners)) {
      for (const line of lines) {
        expect(line.trimEnd().endsWith(';')).toBe(true)
      }
    }
  })

  // Reproduces https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/155: the banner is prepended
  // to every optimized dependency. When a dependency starts with a UMD/IIFE (bootstrap, jquery-ui, …) its first
  // character is `(` or `+`, and without the trailing semicolon ASI merges the banner's last assignment with it
  // (`globalThis.process = globalThis.process || __process_polyfill + function () {}()`). Because the global is
  // already defined, `||` short-circuits and the IIFE never runs, so the library fails to initialize.
  it('does not short-circuit a following IIFE when the global is already defined', () => {
    const [, assignment] = globalShimBanners.process
    let iifeRan = false

    // eslint-disable-next-line no-new-func
    new Function('__process_polyfill', 'markRan', `
      globalThis.process = globalThis.process || {}
      ${assignment}
      +function () { markRan() }()
    `)({}, () => { iifeRan = true })

    expect(iifeRan).toBe(true)
  })
})
