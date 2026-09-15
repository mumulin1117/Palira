import assert from 'node:assert/strict'
import { createDecipheriv } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inflateRawSync } from 'node:zlib'
import test from 'node:test'
import {
  PALIRO_ASSET_ARCHIVE_PREFIX,
  PALIRO_BOOTSTRAP_ARCHIVE,
  PALIRO_INNER_WEB_KEY_HEX,
  PALIRO_OUTER_WEB_KEY_HEX,
  PALIRO_WEB_ARCHIVE_MAGIC,
  PALIRO_WEB_VAULT_DIRECTORY,
  PALIRO_WEB_VAULT_MAGIC,
  paliroProtectWebAssets,
} from './paliro-protect-web-assets.mjs'

function openLayer(data, keyHex) {
  const nonce = data.subarray(0, 12)
  const tag = data.subarray(data.length - 16)
  const ciphertext = data.subarray(12, data.length - 16)
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), nonce)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

function openArchive(protectedData) {
  assert.deepEqual(protectedData.subarray(0, PALIRO_WEB_VAULT_MAGIC.length), PALIRO_WEB_VAULT_MAGIC)
  const inner = openLayer(protectedData.subarray(PALIRO_WEB_VAULT_MAGIC.length), PALIRO_OUTER_WEB_KEY_HEX)
  return inflateRawSync(openLayer(inner, PALIRO_INNER_WEB_KEY_HEX))
}

function decodeArchive(data) {
  assert.deepEqual(data.subarray(0, PALIRO_WEB_ARCHIVE_MAGIC.length), PALIRO_WEB_ARCHIVE_MAGIC)
  let offset = PALIRO_WEB_ARCHIVE_MAGIC.length
  const count = data.readUInt32BE(offset)
  offset += 4
  const entries = new Map()
  for (let index = 0; index < count; index += 1) {
    const pathLength = data.readUInt32BE(offset)
    const dataLength = Number(data.readBigUInt64BE(offset + 4))
    offset += 12
    const path = data.subarray(offset, offset + pathLength).toString('utf8')
    offset += pathLength
    entries.set(path, data.subarray(offset, offset + dataLength))
    offset += dataLength
  }
  assert.equal(offset, data.length)
  return entries
}

test('Web resources are compressed and double-encrypted as two whole archives', async () => {
  const root = await mkdtemp(join(tmpdir(), 'paliro-web-vault-'))
  try {
    await mkdir(join(root, 'assets'))
    await writeFile(join(root, 'index.html'), '<main>Paliro protected content</main>')
    await writeFile(join(root, 'assets/app.js'), 'window.PaliroProtected = true')
    await writeFile(join(root, 'assets/style.css'), 'body { color: white; }')
    await writeFile(join(root, 'assets/photo.png'), Buffer.from('protected-photo'))
    await writeFile(join(root, 'assets/movie.mp4'), Buffer.from('protected-video'))
    await writeFile(join(root, 'assets/paliro-welcome-hero@2x.png'), Buffer.from('plain-auth-art'))
    await writeFile(join(root, 'assets/Montserrat-Bold.ttf'), Buffer.from('plain-font'))

    const result = await paliroProtectWebAssets(root)
    assert.equal(result.bootstrapCount, 3)
    assert.equal(result.assetCount, 2)
    assert.equal(result.plaintextCount, 2)
    assert.equal(PALIRO_INNER_WEB_KEY_HEX.length, 64)
    assert.equal(PALIRO_OUTER_WEB_KEY_HEX.length, 64)
    assert.equal(existsSync(join(root, 'index.html')), false)
    assert.equal(existsSync(join(root, 'assets/app.js')), false)
    assert.equal(existsSync(join(root, 'assets/photo.png')), false)
    assert.equal(existsSync(join(root, 'assets/movie.mp4')), false)
    assert.equal(existsSync(join(root, 'assets/paliro-welcome-hero@2x.png')), true)
    assert.equal(existsSync(join(root, 'assets/Montserrat-Bold.ttf')), true)

    const vaultFiles = await readdir(join(root, PALIRO_WEB_VAULT_DIRECTORY))
    assert.equal(vaultFiles.length, 2)
    assert.ok(vaultFiles.includes(PALIRO_BOOTSTRAP_ARCHIVE))
    const assetArchiveName = vaultFiles.find(name => name.startsWith(PALIRO_ASSET_ARCHIVE_PREFIX))
    assert.ok(assetArchiveName)

    const bootstrapProtected = await readFile(join(root, PALIRO_WEB_VAULT_DIRECTORY, PALIRO_BOOTSTRAP_ARCHIVE))
    const assetProtected = await readFile(join(root, PALIRO_WEB_VAULT_DIRECTORY, assetArchiveName))
    const bootstrap = decodeArchive(openArchive(bootstrapProtected))
    const assets = decodeArchive(openArchive(assetProtected))
    assert.equal(bootstrap.get('index.html').toString(), '<main>Paliro protected content</main>')
    assert.equal(bootstrap.get('assets/app.js').toString(), 'window.PaliroProtected = true')
    assert.equal(assets.get('assets/photo.png').toString(), 'protected-photo')
    assert.equal(assets.get('assets/movie.mp4').toString(), 'protected-video')
    assert.equal(bootstrapProtected.includes(Buffer.from('Paliro protected content')), false)
    assert.equal(assetProtected.includes(Buffer.from('protected-video')), false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('the native loader opens whole archives and persists one protected main-asset cache', async () => {
  const native = await readFile(new URL('../../PaDlroliroBox/PaDlroliroBox/PaliroNativeBridge.swift', import.meta.url), 'utf8')
  const controller = await readFile(new URL('../../PaDlroliroBox/PaDlroliroBox/PaliroBridgeViewController.swift', import.meta.url), 'utf8')
  assert.equal((native.match(/AES\.GCM\.open/g) ?? []).length, 2)
  assert.match(native, /decompressed\(using: \.zlib\)/)
  assert.match(native, /paliro-bootstrap\.pwb/)
  assert.match(native, /paliro-assets-/)
  assert.match(native, /PaliroWebCache/)
  assert.match(native, /completeUntilFirstUserAuthentication/)
  assert.match(native, /isExcludedFromBackup = true/)
  assert.match(native, /FileHandle\(forReadingFrom:/)
  assert.match(controller, /PaliroLocalResources\.springWonderCanvas\(springCuriosityCanvas: "paliro-native\.js"\)/)
})
