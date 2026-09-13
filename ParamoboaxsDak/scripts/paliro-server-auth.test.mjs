import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { createPaliroAccountApi, createPaliroCredentialStore, PaliroAuthError } from '../src/services/paliroAccountApi.js'
import { createPaliroServerSession } from '../src/services/paliroServerSession.js'
import { paliroAcceptServerUser, paliroSeedUsers, paliroLogin, paliroGetSocialState, paliroGetConversations, paliroGetPublishedVideos, paliroUpdateProfile } from '../src/services/paliroLocalStore.js'

function storage() {
  const values = new Map()
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
const profile = () => ({ nickname: 'New Member', avatar: 'blue', bio: 'Coffee and music.', birthday: '1998-10-24', mood: 'Feeling Happy', gender: 'Other', interests: ['Music', 'Coffee', 'Nature'], language: 'en' })
const user = () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'new@example.test', isTestAccount: false, profileComplete: true, profile: profile() })
const response = () => ({ user: user(), accessToken: 'a'.repeat(43), expiresAt: new Date(Date.now() + 3600000).toISOString() })

test('reserved server identity preserves test relationships, messages, profile and zero initial posts across login', () => {
  globalThis.window = { localStorage: storage() }
  try {
    const social = paliroGetSocialState('paliro-test-user', 'en')
    const chats = paliroGetConversations('paliro-test-user', 'en')
    assert.ok(social.following.length > 0 && chats.length > 0)
    const testUser = { ...user(), id: '80962768-0000-4000-8000-000000000001', email: 'paliro@gmail.com', isTestAccount: true }
    const accepted = paliroAcceptServerUser(testUser)
    assert.equal(accepted.userID, 'paliro-test-user')
    assert.deepEqual(paliroGetSocialState(accepted.userID, 'en'), social)
    assert.deepEqual(paliroGetConversations(accepted.userID, 'en'), chats)
    assert.equal(paliroGetPublishedVideos(accepted.userID).length, 0)
    paliroUpdateProfile(accepted.userID, { ...accepted.profile, nickname: 'Keep my local name' })
    assert.equal(paliroAcceptServerUser(testUser).profile.nickname, 'Keep my local name')
    assert.equal(paliroGetConversations(accepted.userID, 'en').length, chats.length)
    assert.ok(!window.localStorage.getItem('paliro.localUsers').includes('67896789'))
  } finally { delete globalThis.window }
})

test('legacy local test password changes without resetting profiles or reintroducing a remote password cache', () => {
  globalThis.window = { localStorage: storage() }
  try {
    const seeded = paliroSeedUsers()[0]
    const legacy = { ...seeded, password: '678678', profile: { ...seeded.profile, nickname: 'Keep my nickname' } }
    const other = { id: 'another-local-user', email: 'other@example.test', password: 'Unchanged-123' }
    window.localStorage.setItem('paliro.localUsers', JSON.stringify([legacy, other]))
    assert.equal(paliroLogin('paliro@gmail.com', '678678').type, 'invalid-password')
    const session = paliroLogin('paliro@gmail.com', '67896789').session
    assert.equal(session.userID, seeded.id)
    assert.equal(session.profile.nickname, 'Keep my nickname')
    assert.deepEqual(paliroSeedUsers().find(value => value.id === other.id), other)
    paliroAcceptServerUser({ ...user(), id: '80962768-0000-4000-8000-000000000001', email: 'paliro@gmail.com', isTestAccount: true })
    assert.equal(paliroSeedUsers().find(value => value.id === seeded.id).password, undefined)
  } finally { delete globalThis.window }
})

test('ordinary remote accounts are isolated; email or a spoofed test flag alone cannot gain test fixtures', () => {
  globalThis.window = { localStorage: storage() }
  try {
    const normal = paliroAcceptServerUser({ ...user(), email: 'paliro@gmail.com', isTestAccount: true })
    assert.equal(normal.userID, user().id)
    assert.deepEqual(normal.profile.interests, profile().interests)
    assert.equal(paliroGetSocialState(normal.userID).following.length, 0)
    assert.equal(paliroGetConversations(normal.userID).length, 0)
    assert.equal(paliroGetPublishedVideos(normal.userID).length, 0)
  } finally { delete globalThis.window }
})

test('registration sends all profile fields exactly once to register, never to login', async () => {
  const calls = []
  const api = createPaliroAccountApi({ fetchImpl: async (url, options) => { calls.push({ url, ...options }); return Response.json(response(), { status: 201 }) } })
  await api.register({ email: ' new@example.test ', password: 'Example-123' }, profile(), 'ko', true)
  assert.equal(calls.length, 1)
  assert.ok(calls[0].url.endsWith('/v1/auth/register'))
  const body = JSON.parse(calls[0].body)
  assert.equal(body.email, 'new@example.test')
  assert.deepEqual(body.profile, { ...profile(), language: 'ko' })
  assert.equal(body.acceptedTerms, true)
})

test('API handles rejection, timeout, network errors and cancellation without local authentication', async () => {
  const denied = createPaliroAccountApi({ fetchImpl: async () => Response.json({ error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 }) })
  await assert.rejects(denied.login('test@example.test', 'wrong'), { code: 'INVALID_CREDENTIALS', status: 401 })
  const offline = createPaliroAccountApi({ fetchImpl: async () => { throw new TypeError('offline') } })
  await assert.rejects(offline.login('test@example.test', 'wrong'), { code: 'NETWORK_ERROR' })
  const slow = createPaliroAccountApi({ timeoutMs: 1, fetchImpl: (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) })
  await assert.rejects(slow.login('test@example.test', 'wrong'), { code: 'TIMEOUT' })
  const controller = new AbortController(); controller.abort()
  await assert.rejects(offline.me('token', controller.signal), { code: 'CANCELLED' })
  assert.throws(() => createPaliroAccountApi({ baseURL: 'http://public.example' }), /HTTPS/)
})

test('web credentials use session storage; native storage failures never fall back to web storage', async () => {
  const web = storage()
  const credentials = createPaliroCredentialStore({ storage: web })
  await credentials.write(response())
  assert.equal((await credentials.read()).accessToken, response().accessToken)
  await credentials.clear()
  assert.equal(web.values.size, 0)
  const native = createPaliroCredentialStore({ storage: web, nativeStore: { write() { throw new Error('Keychain unavailable') } } })
  await assert.rejects(native.write(response()), /Keychain/)
  assert.equal(web.values.size, 0)
})

test('native credential read distinguishes an upgrade from an uninstall and reinstall', async () => {
  const calls = []
  const nativeStore = { read: async options => { calls.push(options); return {} } }
  const upgraded = createPaliroCredentialStore({ nativeStore, installationStorage: { getItem: key => key === 'paliro.session' ? '{}' : null } })
  await upgraded.read()
  const reinstalled = createPaliroCredentialStore({ nativeStore, installationStorage: { getItem: () => null } })
  await reinstalled.read()
  assert.deepEqual(calls, [{ preserveExistingInstallation: true }, { preserveExistingInstallation: false }])
})

test('server verification is mandatory on restore; expired or forged sessions never reach the local adapter', async () => {
  let saved = null, accepts = 0, cleared = 0
  const auth = createPaliroServerSession({
    api: { me: async () => { throw new PaliroAuthError('UNAUTHORIZED', 401) }, logout: async () => {} },
    credentials: { read: async () => saved, write: async value => { saved = value }, clear: async () => { saved = null } },
    acceptUser: () => { accepts++; return {} }, clearLocalSession: () => { cleared++ },
  })
  assert.equal(await auth.restore(), null)
  saved = { accessToken: 'a'.repeat(43), userID: user().id, expiresAt: '2020-01-01' }
  assert.equal(await auth.restore(), null)
  saved = { ...response(), userID: user().id }
  await assert.rejects(auth.restore(), { code: 'UNAUTHORIZED' })
  assert.equal(saved, null)
  assert.equal(accepts, 0)
  assert.equal(cleared, 3)
})

test('successful session acceptance stores only credentials in vault and logout preserves business data', async () => {
  const web = storage()
  const calls = []
  const auth = createPaliroServerSession({ api: { me: async () => user(), logout: async token => calls.push(token) },
    credentials: createPaliroCredentialStore({ storage: web }), acceptUser: value => ({ userID: value.id }), clearLocalSession() {} })
  assert.equal((await auth.accept(response())).userID, user().id)
  assert.equal((await auth.restore()).userID, user().id)
  const stored = JSON.parse([...web.values.values()][0])
  assert.deepEqual(Object.keys(stored).sort(), ['accessToken', 'expiresAt', 'userID'])
  await auth.logout()
  assert.equal(web.values.size, 0)
  assert.equal(calls.length, 1)
})

test('storage failure or cancelled request cannot enter the main module', async () => {
  let accepts = 0
  const auth = createPaliroServerSession({ api: { logout: async () => {} },
    credentials: { write: async () => { throw new Error('quota') }, clear: async () => {} },
    acceptUser: () => { accepts++ }, clearLocalSession() {} })
  await assert.rejects(auth.accept(response()), { code: 'STORAGE_ERROR' })
  const controller = new AbortController(); controller.abort()
  await assert.rejects(auth.accept(response(), controller.signal), { code: 'CANCELLED' })
  assert.equal(accepts, 0)
})

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const functionSource = name => source.match(new RegExp(`(?:async )?function ${name}\\([^]*?\\n}`))[0]
function flowContext() {
  return vm.createContext({ authBusy: { value: false }, authForm: { value: { email: 'new@example.test', password: 'Example-123', confirmPassword: 'Example-123' } },
    errorMessage: { value: '' }, profile: { value: profile() }, profileStep: { value: 1 }, setupOrigin: { value: 'signup' }, hasAgreed: { value: true },
    languagePreference: { value: 'en' }, registrationDraft: null, signupUser: { value: null }, birthdayIssue: { value: '' },
    validateAuth: () => true, t: key => key, beginProfileSetup() {}, scheduleScrollReset() {},
    document: { activeElement: null }, HTMLElement: class {}, AbortController,
    paliroAuthErrorKey: error => error.code,
  })
}
test('signup and intermediate steps keep an in-memory draft and never call an API or create a local user', async () => {
  const context = flowContext()
  vm.runInContext(`${functionSource('submitSignup')}\n${functionSource('nextProfileStep')}`, context)
  context.submitSignup()
  assert.equal(context.registrationDraft.email, 'new@example.test')
  await context.nextProfileStep()
  assert.equal(context.profileStep.value, 2)
  await context.nextProfileStep()
  assert.equal(context.profileStep.value, 3)
  assert.ok(!source.includes('paliroCreateUser('))
  assert.ok(!source.includes('paliroLogin('))
  assert.ok(!source.includes('paliroGetSession('))
})

test('final step prevents duplicate submission, preserves draft after failure and enters main only on success', async () => {
  const context = flowContext()
  let calls = 0, entered = false, fail = true, finish
  context.profileStep.value = 3
  context.registrationDraft = { email: 'new@example.test', password: 'Example-123' }
  context.accountApi = { register: async () => { calls++; await new Promise(resolve => { finish = resolve }); if (fail) throw new PaliroAuthError('NETWORK_ERROR'); return response() } }
  context.serverSession = { accept: async () => ({ userID: user().id }) }
  context.enterMain = () => { entered = true }
  vm.runInContext(functionSource('nextProfileStep'), context)
  const pending = context.nextProfileStep()
  await context.nextProfileStep()
  assert.equal(calls, 1)
  assert.equal(entered, false)
  finish(); await pending
  assert.equal(context.authBusy.value, false)
  assert.equal(context.errorMessage.value, 'NETWORK_ERROR')
  assert.equal(context.registrationDraft.email, 'new@example.test')
  assert.equal(context.profileStep.value, 3)
  fail = false
  const retry = context.nextProfileStep(); finish(); await retry
  assert.equal(entered, true)
  assert.equal(calls, 2)
})
