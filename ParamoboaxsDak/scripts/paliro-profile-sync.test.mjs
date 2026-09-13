import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { paliroMergeRemoteProfile, paliroProfilePatch } from '../src/services/paliroProfileSync.js'
import { paliroAcceptServerUser, paliroCacheServerProfile, paliroUpdateProfile } from '../src/services/paliroLocalStore.js'
import { createPaliroServerSession } from '../src/services/paliroServerSession.js'

const profile = { nickname: 'Server name', bio: 'Coffee and music', birthday: '1998-10-24', avatar: 'violet', mood: 'Want to Chat', gender: 'Other', interests: ['Coffee', 'Music', 'Nature'] }
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'profile@example.test', profileComplete: true, profile: { ...profile, language: 'ko' } }
test('profile PATCH sends changed supported fields only and never sends a local photo or preference', () => {
  assert.deepEqual(paliroProfilePatch({ ...profile, nickname: ' Updated ', photoDataUrl: 'data:image/png;base64,eA==', language: 'en', unknown: true }, profile), { nickname: 'Updated' })
  assert.deepEqual(paliroProfilePatch(profile, profile), {})
  assert.deepEqual(paliroMergeRemoteProfile({ photoDataUrl: 'local-photo', nickname: 'Old' }, { ...profile, photoDataUrl: 'untrusted', unknown: 'ignored', language: 'ko' }), { ...profile, photoDataUrl: 'local-photo' })
})

test('server profile replaces stale supported fields but keeps local photos, business data and other accounts', () => {
  const values = new Map()
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } }
  try {
    const own = paliroAcceptServerUser(user)
    paliroUpdateProfile(own.userID, { ...own.profile, nickname: 'Old cached name', photoDataUrl: 'local-photo' })
    values.set('paliro.conversations', 'untouched')
    const refreshed = paliroCacheServerProfile({ ...user, profile: { ...user.profile, nickname: 'Fresh server name' } }, own.userID)
    assert.equal(refreshed.profile.nickname, 'Fresh server name')
    assert.equal(refreshed.profile.photoDataUrl, 'local-photo')
    assert.equal(values.get('paliro.conversations'), 'untouched')
    const before = [...values.entries()]
    assert.throws(() => paliroCacheServerProfile({ ...user, id: 'different-account' }, own.userID), /identity/)
    assert.deepEqual([...values.entries()], before)
  } finally { delete globalThis.window }
})

test('profile requests use the private current credential, reject after logout and ignore late responses', async () => {
  let reply, lastToken, lastPatch
  const api = { me: token => { lastToken = token; return new Promise(resolve => { reply = resolve }) },
    updateProfile: async (token, patch) => { lastToken = token; lastPatch = patch; return user }, logout: async () => {} }
  const auth = createPaliroServerSession({ api, credentials: { write: async () => {}, clear: async () => {} }, acceptUser: () => ({}), clearLocalSession() {} })
  await auth.accept({ user, accessToken: 'z'.repeat(43), expiresAt: new Date(Date.now() + 60000).toISOString() })
  await auth.saveProfile({ nickname: 'New' })
  assert.equal(lastToken, 'z'.repeat(43))
  assert.deepEqual(lastPatch, { nickname: 'New' })
  const pending = auth.readProfile()
  await auth.logout()
  reply(user)
  await assert.rejects(pending, { code: 'CANCELLED' })
  await assert.rejects(auth.saveProfile({ nickname: 'No' }), { code: 'UNAUTHORIZED' })
})

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const functionSource = name => source.match(new RegExp(`(?:async )?function ${name}\\([^]*?\\n}`))[0]
function context() {
  return vm.createContext({ session: { value: { userID: user.id, serverUserID: user.id, profile } }, route: { value: 'edit-profile' },
    profileController: null, profileLoading: { value: false }, profileSaving: { value: false }, profileReadNotice: { value: '' }, profileSessionExpired: { value: false },
    editableProfile: { value: { ...profile, nickname: 'New draft' } }, profileEditBase: profile,
    editProfileError: { value: '' }, editProfileNotice: { value: '' }, AbortController, document: { activeElement: null },
    t: key => key, paliroAuthErrorKey: error => error.code, getBirthdayIssue: () => '', paliroProfilePatch,
    loadMeState() {}, openRoute(route) { this.route.value = route },
  })
}
test('failed GET retains cached profile and draft; a late successful GET cannot write after leaving', async () => {
  const ctx = context()
  ctx.serverSession = { readProfile: async () => { throw { code: 'NETWORK_ERROR' } } }
  ctx.paliroCacheServerProfile = () => assert.fail('Failed GET cannot write')
  vm.runInContext(functionSource('refreshCurrentProfile'), ctx)
  await ctx.refreshCurrentProfile('edit-profile')
  assert.equal(ctx.profileReadNotice.value, 'profileCachedNotice')
  assert.equal(ctx.editableProfile.value.nickname, 'New draft')
  assert.equal(ctx.profileLoading.value, false)
  let resolve
  ctx.serverSession.readProfile = () => new Promise(done => { resolve = done })
  const pending = ctx.refreshCurrentProfile('edit-profile')
  ctx.route.value = 'home'
  resolve(user); await pending
  assert.equal(ctx.editableProfile.value.nickname, 'New draft')
})

test('failed PATCH keeps the draft, blocks duplicate submissions and never pretends the local save succeeded', async () => {
  const ctx = context()
  let reject, calls = 0
  ctx.serverSession = { saveProfile: () => { calls++; return new Promise((_, fail) => { reject = fail }) } }
  ctx.paliroCacheServerProfile = () => assert.fail('Failed PATCH cannot write')
  vm.runInContext(functionSource('saveEditedProfile'), ctx)
  const pending = ctx.saveEditedProfile()
  await ctx.saveEditedProfile()
  assert.equal(calls, 1)
  reject({ code: 'NETWORK_ERROR' }); await pending
  assert.equal(ctx.editableProfile.value.nickname, 'New draft')
  assert.equal(ctx.profileSaving.value, false)
  assert.equal(ctx.editProfileError.value, 'NETWORK_ERROR')
  assert.equal(ctx.route.value, 'edit-profile')
})

test('expired profile session presents re-login and preserves unsaved data', async () => {
  const ctx = context()
  ctx.serverSession = { saveProfile: async () => { throw { code: 'UNAUTHORIZED', status: 401 } } }
  vm.runInContext(functionSource('saveEditedProfile'), ctx)
  await ctx.saveEditedProfile()
  assert.equal(ctx.profileSessionExpired.value, true)
  assert.equal(ctx.editableProfile.value.nickname, 'New draft')
  assert.equal(ctx.session.value.profile.nickname, profile.nickname)
})

test('successful PATCH caches the returned profile and returns to Me only after success', async () => {
  const ctx = context()
  let patch
  ctx.serverSession = { saveProfile: async value => { patch = value; return { ...user, profile: { ...profile, nickname: 'New draft' } } } }
  ctx.paliroCacheServerProfile = value => ({ userID: user.id, serverUserID: user.id, profile: value.profile })
  ctx.openRoute = value => { ctx.route.value = value }
  vm.runInContext(functionSource('saveEditedProfile'), ctx)
  await ctx.saveEditedProfile()
  assert.deepEqual(patch, { nickname: 'New draft' })
  assert.equal(ctx.route.value, 'me')
  assert.equal(ctx.session.value.profile.nickname, 'New draft')
  assert.equal(ctx.editableProfile.value, null)
})
