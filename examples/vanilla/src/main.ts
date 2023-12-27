/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import { resolve } from 'node:path'
import * as process from 'node:process'
import fs, { readFileSync } from 'node:fs'
import { cloneDeep } from 'lodash-es'
import { fetch } from 'ohmyfetch'

const something = {
  some: true,
  else: 1,
  inner: {
    buffer: [0, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7],
  },
}

class Symbol {}

fs.writeFileSync('./test.txt', 'Hello from fs!', 'utf-8')

console.log(Symbol)
console.log(fs)
console.log(fetch)
console.log(resolve('.'))
console.log(process)
console.log(process.env)
console.log(globalThis.Array)
console.log(Buffer.from([0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF]).readBigUInt64BE(0).toString())
console.log(Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]))
console.log(Array)
console.log(readFileSync('./test.txt', 'utf-8'))
console.log(cloneDeep(something))
