import {
  Blob,
  BlobOptions,
  Buffer as PolyfillBuffer,
  File,
  FileOptions,
  INSPECT_MAX_BYTES,
  // eslint-disable-next-line n/no-deprecated-api
  SlowBuffer,
  TranscodeEncoding,
  atob,
  btoa,
  constants,
  isAscii,
  isUtf8,
  kMaxLength,
  kStringMaxLength,
  resolveObjectURL,
  transcode,
// eslint-disable-next-line unicorn/prefer-node-protocol
} from 'buffer'

// Prefer the host's real `globalThis.Buffer` when present
const Buffer = (typeof globalThis !== 'undefined' && (globalThis as { Buffer?: typeof PolyfillBuffer }).Buffer) || PolyfillBuffer

export {
  Blob,
  BlobOptions,
  Buffer,
  File,
  FileOptions,
  INSPECT_MAX_BYTES,
  SlowBuffer,
  TranscodeEncoding,
  atob,
  btoa,
  constants,
  isAscii,
  isUtf8,
  kMaxLength,
  kStringMaxLength,
  resolveObjectURL,
  transcode,
}

export default Buffer
