// eslint-disable-next-line @typescript-eslint/no-invalid-this
const polyfillGlobal = globalThis || this || self

// Prefer the host's real `globalThis.global` when present
const global = (typeof globalThis !== 'undefined' && (globalThis as { global?: typeof polyfillGlobal }).global) || polyfillGlobal

export { global }
export default global
