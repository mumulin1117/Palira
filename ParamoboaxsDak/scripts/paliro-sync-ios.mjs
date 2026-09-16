import { access, cp, readdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { paliroProtectWebAssets } from './paliro-protect-web-assets.mjs'
import { PALIRO_BUNDLE_DIRECTORY } from './paliro-native-bundle-layout.mjs'

const source = new URL('../dist/', import.meta.url)
const destination = new URL(`../../PaDlroliroBox/PaDlroliroBox/${PALIRO_BUNDLE_DIRECTORY}/`, import.meta.url)
await access(new URL('index.html', source))
await access(new URL('paliro-native.js', source))
// Only replace generated Web assets; never touch simulator or application user data.
for (const entry of await readdir(destination).catch(() => [])) {
  await rm(new URL(entry, destination), { recursive: true, force: true })
}
await cp(source, destination, { recursive: true })
const protection = await paliroProtectWebAssets(fileURLToPath(destination))
console.log(`Paliro Web assets synced as whole archives (${protection.bootstrapCount} bootstrap files, ${protection.assetCount} main assets) to ${fileURLToPath(destination)}`)
