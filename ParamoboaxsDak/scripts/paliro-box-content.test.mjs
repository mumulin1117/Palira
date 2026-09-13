import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.dirname(scriptsDirectory)
const manifest = JSON.parse(await readFile(path.join(scriptsDirectory, 'paliro-box-image-sources.json'), 'utf8'))
const { paliroGetMockMembers, paliroGetMemberPosts } = await import('../src/services/paliroLocalStore.js')

function jpegDimensions(bytes) {
  let offset = 2
  while (offset < bytes.length - 9) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = bytes[offset + 1]
    const segmentLength = bytes.readUInt16BE(offset + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) }
    }
    offset += 2 + segmentLength
  }
  return null
}

test('English and Korean Box fixtures own unique topical images and localized copy', () => {
  const members = [...paliroGetMockMembers('ko'), ...paliroGetMockMembers('en')]
  assert.equal(paliroGetMockMembers('ko').length, 19)
  assert.equal(paliroGetMockMembers('en').length, 20)
  assert.equal(manifest.length, members.length)

  const images = new Set()
  for (const member of members) {
    assert.equal(member.boxPosts.length, 1)
    const post = member.boxPosts[0]
    const expectedImage = `/assets/paliro-box-${member.language}-${String(Number(member.userID.split('-').at(-1)) % 1000).padStart(2, '0')}.jpg`
    assert.equal(post.ownerID, member.id)
    assert.equal(post.images[0], expectedImage)
    assert.notEqual(post.images[0], member.avatar)
    assert.notEqual(post.images[0], member.profileBackground)
    assert.ok(!images.has(post.images[0]), `duplicate Box image ${post.images[0]}`)
    assert.ok(post.interests.length > 0 && post.interests.length <= 3)
    assert.ok(post.interests.every((interest) => member.interests.includes(interest)))
    assert.ok(member.language === 'ko' ? /[가-힣]/.test(post.description) : !/[가-힣]/.test(post.description))
    images.add(post.images[0])
  }
})

test('downloaded Box image manifest is traceable, square, and duplicate-free', async () => {
  const keys = ['memberID', 'picsumID', 'sourcePage', 'localName']
  for (const key of keys) assert.equal(new Set(manifest.map((entry) => entry[key])).size, manifest.length)

  const checksums = new Set()
  for (const entry of manifest) {
    assert.match(entry.sourcePage, /^https:\/\/unsplash\.com\/photos\//)
    const bytes = await readFile(path.join(projectDirectory, 'public', 'assets', entry.localName))
    assert.ok(bytes.length > 10_000)
    assert.equal(bytes[0], 0xff)
    assert.equal(bytes[1], 0xd8)
    assert.deepEqual(jpegDimensions(bytes), { width: 900, height: 900 })
    const checksum = createHash('sha256').update(bytes).digest('hex')
    assert.ok(!checksums.has(checksum), `duplicate downloaded image ${entry.localName}`)
    checksums.add(checksum)
  }
})

test('profile posts hydrate old member snapshots with the same Box content used by a fresh match', () => {
  for (const language of ['en', 'ko']) {
    for (const member of paliroGetMockMembers(language)) {
      const snapshot = { ...member, boxPosts: [{ ...member.boxPosts[0], description: 'Old cached copy', images: [member.avatar] }] }
      const post = paliroGetMemberPosts(snapshot).find((item) => item.contentType === 'box')
      assert.equal(post.id, member.boxPosts[0].id)
      assert.equal(post.description, member.boxPosts[0].description)
      assert.equal(post.thumbnail, member.boxPosts[0].images[0])
      const credit = manifest.find((entry) => entry.memberID === member.id)
      assert.ok(post.interests.includes(credit.interest), `Image topic mismatch: ${member.id}`)
    }
  }
})
