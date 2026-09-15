import assert from 'node:assert/strict'
import test from 'node:test'
import { createPaliroVideoCall, paliroRequestCallPermissions, PALIRO_CALL_WAIT_MS } from '../src/services/paliroVideoCall.js'
import { paliroGetOrCreateConversation, paliroGetMockMembers, paliroSeedUsers, paliroGetSocialState, paliroCanChatWithMember, paliroGetConversations, paliroMarkConversationRead, paliroToggleFollowMember, paliroBlockMember } from '../src/services/paliroLocalStore.js'

function harness(overrides = {}) {
  const states = []
  let expired
  let cleared = false
  const call = createPaliroVideoCall({
    canCall: () => true,
    requestPermissions: async () => {},
    onState: (value) => states.push(value),
    setTimer: (callback, delay) => { assert.equal(delay, PALIRO_CALL_WAIT_MS); expired = callback; return 1 },
    clearTimer: () => { cleared = true },
    ...overrides,
  })
  return { call, states, expire: () => expired?.(), cleared: () => cleared }
}

test('wait begins only after permission; duplicate taps cannot request twice', async () => {
  let allow
  let requests = 0
  const h = harness({ requestPermissions: () => { requests++; return new Promise((resolve) => { allow = resolve }) } })
  const pending = h.call.start()
  assert.equal(h.states.at(-1).state, 'requesting')
  assert.equal(await h.call.start(), false)
  allow()
  assert.equal(await pending, true)
  assert.equal(requests, 1)
  assert.equal(h.states.at(-1).state, 'ringing')
  h.expire()
  assert.equal(h.states.at(-1).state, 'unanswered')
  assert.ok(!h.states.some(({ state }) => state === 'connected'))
})

test('hangup during permission does not allow a late callback to start a call', async () => {
  let allow
  const h = harness({ requestPermissions: () => new Promise((resolve) => { allow = resolve }) })
  const pending = h.call.start()
  h.call.end()
  allow()
  assert.equal(await pending, false)
  assert.equal(h.states.at(-1).state, 'ended')
  assert.equal(h.cleared(), true)
})

test('permission denial and missing hardware show errors, never waiting', async () => {
  for (const [name, key] of [['NotAllowedError', 'callPermissionDenied'], ['NotFoundError', 'callDeviceUnavailable']]) {
    const h = harness({ requestPermissions: async () => { throw Object.assign(new Error(name), { name }) } })
    assert.equal(await h.call.start(), false)
    assert.deepEqual(h.states.at(-1), { state: 'failed', error: key })
  }
})

test('friendship is checked before permissions and again after they resolve', async () => {
  let allowed = false
  let requests = 0
  let h = harness({ canCall: () => allowed, requestPermissions: async () => { requests++ } })
  assert.equal(await h.call.start(), false)
  assert.equal(requests, 0)
  allowed = true
  h = harness({ canCall: () => allowed, requestPermissions: async () => { allowed = false } })
  assert.equal(await h.call.start(), false)
  assert.equal(h.states.at(-1).error, 'callFriendRequired')
})

test('hangup clears timeout and ignores an already queued timeout callback', async () => {
  const h = harness()
  await h.call.start()
  h.call.end()
  h.expire()
  assert.equal(h.states.at(-1).state, 'ended')
  assert.equal(h.cleared(), true)
})

test('native requires both permissions; browser releases permission-check tracks', async () => {
  for (const result of [{ camera: true, microphone: false }, { camera: false, microphone: true }]) {
    await assert.rejects(paliroRequestCallPermissions({ nativePermissions: { request: async () => result } }), /permission-denied/)
  }
  await paliroRequestCallPermissions({ nativePermissions: { request: async () => ({ camera: true, microphone: true }) } })
  let stops = 0
  await paliroRequestCallPermissions({ mediaDevices: { getUserMedia: async (constraints) => {
    assert.deepEqual(constraints, { video: { facingMode: 'user' }, audio: true })
    return { getTracks: () => [{ stop: () => stops++ }, { stop: () => stops++ }] }
  } } })
  assert.equal(stops, 2)
})

test('chat entry is mutual-only across languages; unfollowed or blocked users cannot enter', () => {
  const values = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  try {
    const userID = paliroSeedUsers()[0].id
    paliroGetOrCreateConversation(userID, paliroGetMockMembers('ko')[0])
    const all = paliroGetConversations(userID)
    assert.ok(all.some(({ member }) => member.language === 'en'))
    assert.ok(all.some(({ member }) => member.language === 'ko'))
    paliroGetSocialState(userID, 'ko')
    for (const { member } of all) {
      assert.equal(paliroCanChatWithMember(userID, member.id), true)
      assert.ok(paliroMarkConversationRead(userID, member.id))
    }
    const friend = all[0].member
    paliroToggleFollowMember(userID, friend)
    assert.equal(paliroCanChatWithMember(userID, friend.id), false)
    assert.equal(paliroMarkConversationRead(userID, friend.id), null)
    assert.ok(!paliroGetConversations(userID).some(({ member }) => member.id === friend.id))
    const blocked = all[1].member
    paliroBlockMember(userID, blocked)
    assert.equal(paliroMarkConversationRead(userID, blocked.id), null)
    assert.ok(!paliroGetConversations(userID).some(({ member }) => member.id === blocked.id))
  } finally { delete globalThis.window }
})
