import { Buffer } from 'node:buffer'
import { resolve } from 'node:path'
import * as process from 'node:process'
import fs from 'fs'
import { readFileSync } from 'node:fs'
import { cloneDeep } from 'lodash-es'
import { fetch } from 'ohmyfetch'

const something = {
  some: true,
  else: 1,
  inner: {
    buffer: [0, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7],
  },
}

fs.writeFileSync('./test.txt', 'Hello from fs!', 'utf-8')

console.log(fs)
console.log(fetch)
console.log(resolve('.'))
console.log(process)
console.log(process.env)
console.log(globalThis.Array)
console.log(Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]).readBigUInt64BE(0))
console.log(Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]))
console.log(Array)
console.log(readFileSync('./test.txt', 'utf-8'))
console.log(cloneDeep(something))
