import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { paliroVideoIdentityFixtures } from '../src/services/paliroVideoIdentityFixtures.js'
import { paliroToggleVideoCommentLike } from '../src/services/paliroLocalStore.js'
import { paliroSeedUsers, paliroGetMockMembers, paliroGetVideoFeed, paliroGetMemberPosts, paliroGetSocialState, paliroGetConversations, paliroGetConversation, paliroGetBlockedUsers } from '../src/services/paliroLocalStore.js'

function withStore(run) {
  const values = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  try { run(paliroSeedUsers()[0].id, values) } finally { delete globalThis.window }
}

test('English and Korean comment likes exceed 14, persist across reads and return to baseline on unlike', () => withStore(userID => {
  for (const language of ['en', 'ko']) {
    const video = paliroGetVideoFeed(userID, language)[0]
    const comment = video.comments[0]
    assert.equal(comment.likes, 14)
    assert.equal(comment.liked, false)
    const readComment = () => paliroGetVideoFeed(userID, language).find(item => item.id === video.id).comments.find(item => item.id === comment.id)
    assert.equal(paliroToggleVideoCommentLike(userID, video.id, comment.id).type, 'success')
    for (let read = 0; read < 3; read++) {
      assert.equal(readComment().likes, 15)
      assert.equal(readComment().liked, true)
    }
    paliroToggleVideoCommentLike(userID, video.id, comment.id)
    assert.equal(readComment().likes, 14)
    assert.equal(readComment().liked, false)
  }
}))

test('nine video identities have unique owners, sources and generated assets', async () => {
  const fixtures = paliroVideoIdentityFixtures
  assert.equal(fixtures.length, 9)
  for (const key of ['ownerID', 'source', 'avatar', 'profileBackground']) {
    assert.equal(new Set(fixtures.map((item) => item[key])).size, 9)
  }
  const hashes = new Set()
  for (const fixture of fixtures) {
    for (const asset of [fixture.avatar, fixture.profileBackground]) {
      const bytes = await readFile(new URL(`../public${asset}`, import.meta.url))
      assert.equal(bytes.readUInt16BE(0), 0xffd8)
      assert.ok(bytes.length > 5000)
      hashes.add(createHash('sha256').update(bytes).digest('hex'))
    }
    for (const [x, y, width, height] of [fixture.avatarCrop, fixture.heroCrop]) {
      assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0)
      assert.ok(x + width <= 1.000001 && y + height <= 1.000001)
    }
  }
  assert.equal(hashes.size, 18)
})

test('feed, profile and comments share identity while video covers and Box images stay separate', () => withStore((userID) => {
  const members = new Map(['ko', 'en'].flatMap(paliroGetMockMembers).map((member) => [member.id, member]))
  for (const language of ['ko', 'en']) {
    const feed = paliroGetVideoFeed(userID, language)
    assert.equal(feed.length, language === 'ko' ? 3 : 6)
    for (const video of feed) {
      const fixture = paliroVideoIdentityFixtures.find((item) => item.ownerID === video.ownerID)
      const member = members.get(video.ownerID)
      assert.equal(video.source, fixture.source)
      const originalAvatar = `/assets/paliro-member-${language}-${String(fixture.index).padStart(2, '0')}-photo.png`
      assert.equal(video.member.avatar, fixture.avatarFromVideo ? fixture.avatar : originalAvatar)
      assert.equal(member.profileBackground, fixture.avatarFromVideo ? fixture.profileBackground : originalAvatar)
      assert.equal(video.caption, fixture.caption)
      assert.equal(member.bio, fixture.bio)
      assert.match(video.thumbnail, /-cover\.png$/)
      const posts = paliroGetMemberPosts(member)
      assert.equal(posts.filter((post) => post.contentType === 'video').length, 1)
      assert.equal(new Set([member.avatar, member.profileBackground, video.thumbnail, member.boxPosts[0].images[0]]).size, fixture.avatarFromVideo ? 4 : 3)
      for (const comment of video.comments) assert.equal(comment.authorAvatar, members.get(comment.authorID).avatar)
    }
  }
  for (const member of members.values()) {
    if (!paliroVideoIdentityFixtures.some((item) => item.ownerID === member.id)) {
      assert.match(member.avatar, /paliro-member-(ko|en)-\d+-photo\.png$/)
    }
  }
}))

test('scene videos use original portraits for both avatar and background; person videos keep video portraits', async () => {
  const originals = {
    'paliro-member-haneul': '/assets/paliro-member-ko-01-photo.png',
    'paliro-member-minji': '/assets/paliro-member-ko-02-photo.png',
    'paliro-member-seoyun': '/assets/paliro-member-ko-03-photo.png',
    'paliro-member-nova': '/assets/paliro-member-en-03-photo.png',
  }
  assert.equal(paliroVideoIdentityFixtures.filter((fixture) => fixture.avatarFromVideo).length, 5)
  for (const fixture of paliroVideoIdentityFixtures) {
    const member = paliroGetMockMembers(fixture.language).find((item) => item.id === fixture.ownerID)
    assert.equal(member.avatar, originals[fixture.ownerID] ?? fixture.avatar)
    if (originals[fixture.ownerID]) {
      const bytes = await readFile(new URL(`../public${member.avatar}`, import.meta.url))
      assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a')
    }
    assert.equal(member.profileBackground, originals[fixture.ownerID] ?? fixture.profileBackground)
  }
})

test('old social and conversation snapshots hydrate images without resetting relationships or messages', () => withStore((userID, values) => {
  const social = paliroGetSocialState(userID)
  const conversations = paliroGetConversations(userID)
  const storedSocial = JSON.parse(values.get('paliro.socialState'))
  for (const list of ['followers', 'following']) {
    storedSocial[userID][list].forEach((member) => {
      member.avatar = '/old-avatar.png'
      member.profileBackground = '/old-background.png'
    })
  }
  values.set('paliro.socialState', JSON.stringify(storedSocial))
  const storedConversations = JSON.parse(values.get('paliro.conversations'))
  storedConversations[userID].forEach((row) => {
    row.member.avatar = '/old-avatar.png'
    row.member.profileBackground = '/old-background.png'
  })
  values.set('paliro.conversations', JSON.stringify(storedConversations))
  assert.deepEqual(paliroGetSocialState(userID), social)
  assert.deepEqual(paliroGetConversations(userID), conversations)
  for (const row of conversations) {
    const refreshed = paliroGetConversation(userID, row.member.id)
    assert.equal(refreshed.member.avatar, row.member.avatar)
    assert.deepEqual(refreshed.messages, row.messages)
  }
}))

test('persisted comment and blacklist avatars refresh without losing likes or timestamps', () => withStore((userID, values) => {
  const video = paliroGetVideoFeed(userID, 'en')[0]
  const member = video.member
  const comment = { id: 'old-comment', authorID: member.id, authorName: member.name, authorAvatar: '/old-avatar.png', body: 'Keep this message', baseLikes: 3, createdAt: '2026-09-01T12:00:00Z' }
  const saved = { [userID]: { interactions: { [video.id]: { liked: true, comments: [comment], commentLikes: { [comment.id]: true } } }, published: [], hiddenVideoIDs: [] } }
  values.set('paliro.videoState', JSON.stringify(saved))
  const refreshed = paliroGetVideoFeed(userID, 'en')[0]
  assert.equal(refreshed.liked, true)
  assert.deepEqual(refreshed.comments.at(-1), { ...comment, authorAvatar: member.avatar, liked: true, likes: 4 })
  const entry = { id: member.id, name: member.name, avatar: '/old-avatar.png', blockedAt: '2026-09-01T12:00:00Z' }
  values.set('paliro.blockedUsers', JSON.stringify({ [userID]: [entry] }))
  assert.deepEqual(paliroGetBlockedUsers(userID), [{ ...entry, avatar: member.avatar }])
  assert.ok(!paliroGetVideoFeed(userID, 'en').some((item) => item.ownerID === member.id))
  assert.deepEqual(JSON.parse(values.get('paliro.videoState')), saved)
}))
