import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const thisDir = dirname(fileURLToPath(import.meta.url))

await build({
  bundle: true,
  entryPoints: [join(thisDir, './index.cjs')],
  format: 'iife',
  inject: [
    join(thisDir, '../buffer'),
    join(thisDir, '../global'),
    join(thisDir, '../process'),
  ],
  outdir: join(thisDir, './dist'),
  outExtension: { '.js': '.cjs' },
})
