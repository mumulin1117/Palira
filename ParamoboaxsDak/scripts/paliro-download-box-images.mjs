import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.dirname(scriptsDirectory)
const manifestPath = path.join(scriptsDirectory, 'paliro-box-image-sources.json')
const destinationDirectory = path.join(projectDirectory, 'public', 'assets')
const entries = JSON.parse(await readFile(manifestPath, 'utf8'))

const uniqueValues = (key) => new Set(entries.map((entry) => entry[key])).size === entries.length
if (!uniqueValues('memberID') || !uniqueValues('picsumID') || !uniqueValues('sourcePage') || !uniqueValues('localName')) {
  throw new Error('Paliro Box image manifest contains duplicate ownership or source data.')
}

await mkdir(destinationDirectory, { recursive: true })
const checksums = new Set()

for (const entry of entries) {
  const response = await fetch(entry.downloadURL, {
    headers: { 'User-Agent': 'Paliro local fixture asset downloader' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`Unable to download ${entry.localName}: HTTP ${response.status}`)

  const bytes = Buffer.from(await response.arrayBuffer())
  const checksum = createHash('sha256').update(bytes).digest('hex')
  if (checksums.has(checksum)) throw new Error(`Duplicate downloaded image: ${entry.localName}`)
  checksums.add(checksum)
  await writeFile(path.join(destinationDirectory, entry.localName), bytes)
  console.log(`${entry.localName} ${Math.round(bytes.length / 1024)}KB ${checksum.slice(0, 12)}`)
}
