const global = globalThis || this || self

export { Buffer } from 'buffer-polyfill'
export { default as process } from 'process-polyfill'
export { global }
