import { Buffer } from 'node:buffer'
import { resolve } from 'node:path'
import * as process from 'node:process'
import fs from 'node:fs'
import { fetch } from 'ohmyfetch'

console.log(fetch)
console.log(resolve('.'))
console.log(process)
console.log(process.env)
console.log(globalThis.Array)
console.log(Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]).readBigUInt64BE(0))
console.log(Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]))
console.log(Array)
console.log(fs)
