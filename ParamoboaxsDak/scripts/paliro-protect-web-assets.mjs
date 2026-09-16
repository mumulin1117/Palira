import { createCipheriv, createHash, randomBytes } from 'node:crypto'
import { readdir, readFile, rm, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { basename, extname, join, relative, resolve, sep } from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { paliroArrangePlainResources, paliroPruneEmptyDirectories } from './paliro-native-bundle-layout.mjs'

export const PALIRO_INNER_WEB_KEY_HEX = 'c2f7135197de12420a3c494c42588831826566be470aac896740b58ff2ddf2ec'
export const PALIRO_OUTER_WEB_KEY_HEX = '3df1ae98e26c4fdc4afdaf45490ce4b5b73152f796c07691aa51ec634d862550'
export const PALIRO_WEB_VAULT_DIRECTORY = 'PaliroDewArchive'
export const PALIRO_WEB_VAULT_MAGIC = Buffer.from('PALIRO3\0', 'ascii')
export const PALIRO_WEB_ARCHIVE_MAGIC = Buffer.from('PALIROPACK1\0', 'ascii')
export const PALIRO_BOOTSTRAP_ARCHIVE = 'PaliroFirstBloom.pwb'
export const PALIRO_ASSET_ARCHIVE_PREFIX = 'PaliroLunarPetals-'

const bootstrapExtensions = new Set(['.cjs', '.css', '.html', '.js', '.json', '.map', '.mjs', '.svg', '.txt', '.wasm', '.webmanifest', '.xml'])
const startupPlaintextPrefixes = [
  'paliro-avatar-',
  'paliro-launch-',
  'paliro-login-',
  'paliro-profile-calendar',
  'paliro-profile-camera',
  'paliro-signup-',
  'paliro-splash-',
  'paliro-welcome-',
]
const startupPlaintextExtensions = new Set(['.otf', '.ttf', '.woff', '.woff2'])

function seal(data, keyHex) {
  const nonce = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), nonce)
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()])
  return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()])
}

function isStartupPlaintext(relativePath) {
  const name = basename(relativePath).toLowerCase()
  const extension = extname(name)
  return startupPlaintextExtensions.has(extension) || startupPlaintextPrefixes.some(prefix => name.startsWith(prefix))
}

async function collectFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === PALIRO_WEB_VAULT_DIRECTORY) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function encodeArchive(entries) {
  const chunks = [PALIRO_WEB_ARCHIVE_MAGIC]
  const count = Buffer.alloc(4)
  count.writeUInt32BE(entries.length)
  chunks.push(count)

  for (const { relativePath, data } of entries) {
    const path = Buffer.from(relativePath, 'utf8')
    const header = Buffer.alloc(12)
    header.writeUInt32BE(path.length, 0)
    header.writeBigUInt64BE(BigInt(data.length), 4)
    chunks.push(header, path, data)
  }
  return Buffer.concat(chunks)
}

function protectArchive(entries, compressionLevel) {
  const packed = encodeArchive(entries)
  const compressed = deflateRawSync(packed, { level: compressionLevel })
  const inner = seal(compressed, PALIRO_INNER_WEB_KEY_HEX)
  const outer = seal(inner, PALIRO_OUTER_WEB_KEY_HEX)
  return Buffer.concat([PALIRO_WEB_VAULT_MAGIC, outer])
}

export async function paliroProtectWebAssets(webRoot) {
  const root = resolve(webRoot)
  const vault = join(root, PALIRO_WEB_VAULT_DIRECTORY)
  await rm(vault, { recursive: true, force: true })
  await mkdir(vault, { recursive: true })

  const bootstrapEntries = []
  const assetEntries = []
  let plaintextCount = 0
  const plaintextPaths = []
  for (const file of await collectFiles(root)) {
    const relativePath = relative(root, file).split(sep).join('/')
    if (isStartupPlaintext(relativePath)) {
      plaintextCount += 1
      plaintextPaths.push(relativePath)
      continue
    }
    const entry = { relativePath, data: await readFile(file) }
    if (bootstrapExtensions.has(extname(file).toLowerCase())) bootstrapEntries.push(entry)
    else assetEntries.push(entry)
  }

  if (bootstrapEntries.length === 0) throw new Error('No Web bootstrap assets were found')
  bootstrapEntries.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  assetEntries.sort((a, b) => a.relativePath.localeCompare(b.relativePath))

  await writeFile(join(vault, PALIRO_BOOTSTRAP_ARCHIVE), protectArchive(bootstrapEntries, 9))

  let assetArchive = null
  if (assetEntries.length > 0) {
    const assetData = protectArchive(assetEntries, 6)
    const version = createHash('sha256').update(assetData).digest('hex').slice(0, 24)
    assetArchive = `${PALIRO_ASSET_ARCHIVE_PREFIX}${version}.pwb`
    await writeFile(join(vault, assetArchive), assetData)
  }

  await Promise.all([...bootstrapEntries, ...assetEntries].map(entry => rm(join(root, entry.relativePath))))
  await paliroArrangePlainResources(root, plaintextPaths)
  await paliroPruneEmptyDirectories(root)
  return {
    bootstrapCount: bootstrapEntries.length,
    assetCount: assetEntries.length,
    plaintextCount,
    assetArchive,
    vault,
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  const root = process.argv[2]
  if (!root) throw new Error('Usage: node paliro-protect-web-assets.mjs <public-directory>')
  const result = await paliroProtectWebAssets(root)
  console.log(`Protected ${result.bootstrapCount} bootstrap files and ${result.assetCount} main assets in two whole archives at ${fileURLToPath(pathToFileURL(result.vault))}`)
}
