import { access, cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { paliroProtectWebAssets, PALIRO_WEB_VAULT_DIRECTORY } from './paliro-protect-web-assets.mjs'
import { PALIRO_PLAIN_DIRECTORY } from './paliro-native-bundle-layout.mjs'

const source = new URL('../dist/', import.meta.url)
const destination = new URL('../../PaDlroliroBox/PaDlroliroBox/', import.meta.url)
await access(new URL('index.html', source))
await access(new URL('paliro-native.js', source))
const staging = await mkdtemp(join(tmpdir(), 'paliro-ios-resources-'))
try {
  await cp(source, staging, { recursive: true })
  const protection = await paliroProtectWebAssets(staging)
  for (const directory of [PALIRO_PLAIN_DIRECTORY, PALIRO_WEB_VAULT_DIRECTORY]) {
    const generated = join(staging, directory)
    const bundled = new URL(`${directory}/`, destination)
    await rm(bundled, { recursive: true, force: true })
    await cp(generated, bundled, { recursive: true })
  }
  console.log(`Paliro Web assets synced as sibling folders (${protection.bootstrapCount} bootstrap files, ${protection.assetCount} main assets) to ${fileURLToPath(destination)}`)
} finally {
  await rm(staging, { recursive: true, force: true })
}
