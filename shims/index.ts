// eslint-disable-next-line @typescript-eslint/no-invalid-this
const global = globalThis || this || self

export { Buffer } from 'buffer-polyfill'
// We cannot use `process-polyfill` as the package name due to a bug in Yarn v1. The errors results in a dependency
// conflict with `node-stdlib-browser` which fails to import `process/browser.js`.
// https://github.com/yarnpkg/yarn/issues/6907
export { default as process } from 'node:process'
export { global }
