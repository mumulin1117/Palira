import { access, cp, readdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const source = new URL('../dist/', import.meta.url)
const destination = new URL('../ios/App/App/public/', import.meta.url)
await access(new URL('index.html', source))
await access(new URL('paliro-native.js', source))
// Only replace generated Web assets; never touch simulator or application user data.
for (const entry of await readdir(destination).catch(() => [])) {
  await rm(new URL(entry, destination), { recursive: true, force: true })
}
await cp(source, destination, { recursive: true })
console.log(`Paliro Web assets synced to ${fileURLToPath(destination)}`)
