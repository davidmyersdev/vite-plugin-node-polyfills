// eslint-disable-next-line unicorn/prefer-node-protocol
import { join } from 'path/posix'

document.querySelector('#solid-app')!.textContent = join('foo', 'bar')
