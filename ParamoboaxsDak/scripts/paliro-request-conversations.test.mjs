import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { paliroGetOrCreateConversation, paliroGetMockMembers, paliroSeedUsers, paliroGetAvailableMatchMembers, paliroSendFriendRequest, paliroGetConversations, paliroGetConversation, paliroMarkConversationRead, paliroCanChatWithMember, paliroSendConversationMessage, paliroSendConversationAudioMessage, paliroBlockMember, paliroGetIncomingFriendRequests, paliroAcceptIncomingFriendRequest } from '../src/services/paliroLocalStore.js'

function withStore(run) {
  const values = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  try { run(paliroSeedUsers()[0].id, values) } finally { delete globalThis.window }
}

test('test account seeds only two English conversations and migrates cached Korean fixtures', () => withStore((userID, values) => {
  const original = paliroGetConversations(userID)
  assert.equal(original.length, 2)
  assert.ok(original.every(c => c.member.language === 'en' && !/[가-힣]/u.test(c.messages[0].body)))
  const legacy = ['haneul', 'minji', 'seoyun'].map((name, index) => ({
    member: paliroGetMockMembers('ko')[index], unreadCount: 2,
    messages: [{ id: `paliro-message-${name}-1`, sender: 'friend', body: 'Legacy fixture' }],
  }))
  const english = JSON.parse(values.get('paliro.conversations'))[userID]
  values.set('paliro.conversations', JSON.stringify({ [userID]: [...english, ...legacy], other: legacy }))
  for (let i = 0; i < 3; i++) assert.deepEqual(paliroGetConversations(userID), original)
  assert.deepEqual(JSON.parse(values.get('paliro.conversations')).other, legacy)
  assert.equal(paliroGetConversations('new-user').length, 0)
  // Removing old examples must not cap the list or prevent new chats with those members.
  const created = paliroGetOrCreateConversation(userID, paliroGetMockMembers('ko')[0])
  assert.equal(paliroGetConversations(userID).length, 3)
  assert.equal(paliroGetConversation(userID, created.member.id).messages.length, created.messages.length)
}))

test('one request creates one locked conversation with the original message, time and language', () => withStore((userID, values) => {
  for (const language of ['en', 'ko']) {
    const member = paliroGetAvailableMatchMembers(userID, language)[0]
    assert.equal(paliroSendFriendRequest(userID, member.id, '  Hello 안녕  ').type, 'success')
    const persisted = JSON.parse(values.get('paliro.friendRequests'))[userID][member.id]
    for (let i = 0; i < 3; i++) {
      const matches = paliroGetConversations(userID, language).filter((c) => c.member.id === member.id)
      assert.equal(matches.length, 1)
      const row = matches[0]
      assert.equal(row.isLocked, true)
      assert.equal(row.unreadCount, 0)
      assert.equal(row.messages.filter(m => m.type === 'friend-request').length, 1)
      assert.equal(row.messages.at(-1).body, 'Hello 안녕')
      assert.equal(row.messages.at(-1).sentAt, persisted.requestedAt)
      assert.deepEqual(paliroGetConversations(userID, language === 'en' ? 'ko' : 'en').find(c => c.member.id === member.id), row)
    }
    assert.equal(paliroSendFriendRequest(userID, member.id, 'replacement').type, 'already-pending')
    assert.equal(JSON.parse(values.get('paliro.friendRequests'))[userID][member.id].message, 'Hello 안녕')
    assert.equal(paliroCanChatWithMember(userID, member.id), false)
    assert.equal(paliroMarkConversationRead(userID, member.id), null)
    assert.equal(paliroSendConversationMessage(userID, member.id, 'not yet').type, 'not-friends')
    assert.equal(paliroSendConversationAudioMessage(userID, member.id, { source: 'data:audio/webm;base64,dGVzdA==', durationSeconds: 2 }).type, 'not-friends')
  }
}))

test('older persisted requests without a member snapshot are hydrated without duplicates', () => withStore((userID, values) => {
  const member = paliroGetAvailableMatchMembers(userID, 'en')[0]
  values.set('paliro.friendRequests', JSON.stringify({ [userID]: { [member.id]: { status: 'pending', message: 'Original request', requestedAt: '2026-09-01T01:00:00.000Z', requestLimit: 1 } } }))
  const first = paliroGetConversations(userID).find(c => c.member.id === member.id)
  const again = paliroGetConversations(userID).find(c => c.member.id === member.id)
  assert.ok(first.isLocked)
  assert.deepEqual(again, first)
  assert.deepEqual(paliroGetConversations(userID, 'ko').find(c => c.member.id === member.id), first)
  assert.ok(!paliroGetConversations('different-user').some(c => c.member.id === member.id))
}))

test('accepting an incoming request unlocks the existing row and retains the sent request', () => withStore((userID, values) => {
  const incoming = paliroGetIncomingFriendRequests(userID).find(r => !paliroCanChatWithMember(userID, r.member.id))
  assert.ok(incoming)
  assert.equal(paliroSendFriendRequest(userID, incoming.member.id, 'Let us connect', incoming.member).type, 'success')
  assert.ok(paliroGetConversations(userID).find(c => c.member.id === incoming.member.id).isLocked)
  assert.equal(paliroAcceptIncomingFriendRequest(userID, incoming.id).type, 'success')
  assert.equal(JSON.parse(values.get('paliro.friendRequests'))[userID][incoming.member.id].status, 'accepted')
  const rows = paliroGetConversations(userID).filter(c => c.member.id === incoming.member.id)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].isLocked, false)
  assert.ok(paliroMarkConversationRead(userID, incoming.member.id))
  assert.equal(paliroSendConversationMessage(userID, incoming.member.id, 'Now we can chat').type, 'success')
  assert.equal(paliroGetConversation(userID, incoming.member.id).messages.filter(m => m.type === 'friend-request').length, 1)
  paliroGetOrCreateConversation(userID, paliroGetMockMembers('ko')[0])
  const original = paliroGetConversations(userID).find(c => c.member.id === incoming.member.id)
  for (const language of ['en', 'ko', 'en']) {
    assert.deepEqual(paliroGetConversations(userID, language).find(c => c.member.id === incoming.member.id), original)
  }
}))

test('blocking removes a pending conversation and prevents another request', () => withStore((userID) => {
  const member = paliroGetAvailableMatchMembers(userID, 'ko')[0]
  paliroSendFriendRequest(userID, member.id, 'Hi')
  assert.ok(paliroGetConversations(userID).some(c => c.member.id === member.id))
  paliroBlockMember(userID, member)
  for (const language of ['', 'en', 'ko']) assert.ok(!paliroGetConversations(userID, language).some(c => c.member.id === member.id))
  assert.equal(paliroSendFriendRequest(userID, member.id, 'Again').type, 'blocked')
}))

test('all conversations retain their order, unread counts and history across language changes', () => withStore(userID => {
  paliroGetOrCreateConversation(userID, paliroGetMockMembers('ko')[0])
  const original = paliroGetConversations(userID)
  assert.ok(original.some(c => c.member.language === 'en'))
  assert.ok(original.some(c => c.member.language === 'ko'))
  for (const language of ['en', 'ko', 'en']) {
    assert.deepEqual(paliroGetConversations(userID, language), original)
  }
  for (const language of ['en', 'ko']) {
    const opposite = language === 'en' ? 'ko' : 'en'
    const conversation = paliroGetConversations(userID, language).find(c => c.member.language === language)
    assert.ok(paliroGetConversations(userID, opposite).some(c => c.member.id === conversation.member.id))
    assert.equal(paliroSendConversationMessage(userID, conversation.member.id, 'Hello! 안녕하세요!').type, 'success')
    const saved = paliroGetConversations(userID, language).find(c => c.member.id === conversation.member.id)
    for (const locale of [opposite, language, opposite]) {
      assert.deepEqual(paliroGetConversations(userID, locale).find(c => c.member.id === conversation.member.id), saved)
    }
  }
}))

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const functionSource = (name) => source.match(new RegExp(`function ${name}\\([^]*?\\n}`))[0]
test('tapping a locked row opens a pending reminder without navigation', () => {
  const context = vm.createContext({
    session: { value: { userID: 'self' } }, profileReminder: { value: '' },
    loadMeState() {}, loadMessageState() {}, paliroCanChatWithMember: () => false,
    paliroGetFriendRequestStatus: () => 'pending',
    paliroMarkConversationRead() { assert.fail('Locked rows cannot be opened') },
    openRoute() { assert.fail('Locked rows cannot navigate') },
  })
  vm.runInContext(functionSource('openConversation'), context)
  context.openConversation('pending-member')
  assert.equal(context.profileReminder.value, 'request-pending')
})

test('sending shows success only after persistence; failures preserve the draft', () => {
  for (const fails of [false, true]) {
    let refreshed = false
    const context = vm.createContext({
      session: { value: { userID: 'self' } }, matchedFriend: { value: { id: 'friend' } },
      friendRequestMessage: { value: 'draft' }, friendRequestSending: { value: false }, friendRequestStatus: { value: 'none' },
      friendRequestError: { value: '' }, friendRequestTextarea: { value: null },
      showFriendRequestModal: { value: true }, profileReminder: { value: '' }, t: (key) => key,
      paliroSendFriendRequest() { if (fails) throw new Error('storage full'); return { type: 'success' } },
      loadMessageState() { refreshed = true },
    })
    vm.runInContext(functionSource('sendMatchFriendRequest'), context)
    context.sendMatchFriendRequest()
    assert.equal(context.friendRequestSending.value, false)
    assert.equal(context.profileReminder.value, fails ? '' : 'request-sent')
    assert.equal(context.showFriendRequestModal.value, fails)
    assert.equal(refreshed, !fails)
    assert.equal(context.friendRequestMessage.value, 'draft')
  }
})
