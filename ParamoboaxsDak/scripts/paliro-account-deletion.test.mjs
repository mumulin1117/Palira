import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { createPaliroAccountApi } from '../src/services/paliroAccountApi.js'
import { createPaliroServerSession } from '../src/services/paliroServerSession.js'
import { paliroAcceptServerUser, paliroDeleteLocalAccount, paliroSeedUsers } from '../src/services/paliroLocalStore.js'

test('deletion uses DELETE with Bearer and password; only 204 confirms success', async () => {
  let call
  const api = createPaliroAccountApi({ fetchImpl: async (url, options) => { call = { url, ...options }; return new Response(null, { status: 204 }) } })
  await api.deleteAccount('secret-token', 'private-password')
  assert.equal(call.method, 'DELETE')
  assert.ok(call.url.endsWith('/palirov1/paliro/me/account'))
  assert.equal(call.headers.Authorization, 'Bearer secret-token')
  assert.deepEqual(JSON.parse(call.body), { password: 'private-password' })
  const invalid = createPaliroAccountApi({ fetchImpl: async () => Response.json(null) })
  await assert.rejects(invalid.deleteAccount('token', 'password'), { code: 'INVALID_RESPONSE' })
})

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'delete@example.test', profileComplete: true, profile: { nickname: 'Delete Only Me', avatar: 'violet', birthday: '1998-10-24', interests: [], language: 'en' } }
const response = { user, accessToken: 'x'.repeat(43), expiresAt: new Date(Date.now() + 3600000).toISOString() }
test('failed deletion preserves credentials; confirmed deletion clears them even when storage cleanup fails', async () => {
  let fail = true, clearCount = 0, localCount = 0, storageFail = false
  const auth = createPaliroServerSession({
    api: { deleteAccount: async () => { if (fail) throw { code: 'INVALID_CREDENTIALS' } } },
    credentials: { write: async () => {}, clear: async () => { clearCount++; if (storageFail) throw new Error('storage') } },
    acceptUser: () => ({}), clearLocalSession: () => { localCount++ },
  })
  await auth.accept(response)
  await assert.rejects(auth.deleteAccount('wrong'), { code: 'INVALID_CREDENTIALS' })
  assert.equal(clearCount, 0)
  assert.equal(localCount, 0)
  fail = false; storageFail = true
  assert.deepEqual(await auth.deleteAccount('correct'), { deleted: true, cleanupFailed: true })
  assert.equal(clearCount, 1)
  assert.equal(localCount, 1)
  await assert.rejects(auth.deleteAccount('correct'), { code: 'UNAUTHORIZED' })
})

test('local deletion removes only the matching account records and preserves global consent and other users', () => {
  const values = new Map()
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } }
  try {
    const own = paliroAcceptServerUser(user)
    for (const key of ['paliro.conversations', 'paliro.socialState', 'paliro.videoState', 'paliro.languagePreference.v2', 'paliro.boxUsage', 'paliro.friendRequests']) {
      values.set(key, JSON.stringify({ [own.userID]: { private: true }, other: { keep: true } }))
    }
    values.set('paliro.eulaAccepted', 'true')
    const before = [...values.entries()]
    assert.throws(() => paliroDeleteLocalAccount(own.userID, 'wrong-id'), /identity/)
    assert.deepEqual([...values.entries()], before)
    paliroDeleteLocalAccount(own.userID, user.id)
    assert.ok(!JSON.parse(values.get('paliro.localUsers')).some(value => value.id === own.userID))
    assert.equal(values.get('paliro.session'), undefined)
    assert.equal(values.get('paliro.eulaAccepted'), 'true')
    assert.deepEqual(JSON.parse(values.get('paliro.conversations')), { other: { keep: true } })
    const testUser = { ...user, id: '80962768-0000-4000-8000-000000000001', email: 'paliro@gmail.com', isTestAccount: true }
    const localTest = paliroAcceptServerUser(testUser)
    paliroDeleteLocalAccount(localTest.userID, testUser.id)
    assert.ok(!paliroSeedUsers().some(value => value.id === 'paliro-test-user'))
  } finally { delete globalThis.window }
})

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const functionSource = name => source.match(new RegExp(`(?:async )?function ${name}\\([^]*?\\n}`))[0]
function context() {
  const ctx = { session: { value: { userID: 'local', serverUserID: user.id } },
    accountDeletionBusy: { value: false }, showAccountDeletionNotice: { value: true }, accountDeletionPassword: { value: '' },
    accountDeletionError: { value: '' }, accountDeletionExpired: { value: false }, accountDeletionDialog: { value: null }, profileController: null, accountNotice: { value: '' },
    editableProfile: { value: {} }, signupUser: { value: {} }, profile: { value: {} }, activeConversation: { value: {} },
    conversations: { value: [] }, incomingFriendRequests: { value: [] }, registrationDraft: null, incompleteAuth: null,
    authForm: { value: {} }, showBoxRules: { value: false }, route: { value: 'settings' }, errorMessage: { value: '' },
    document: { activeElement: null }, window: { history: { replaceState() {} } }, t: key => key,
    paliroAuthErrorKey: error => error.code, createDefaultProfile: () => ({}),
  }
  return vm.createContext(ctx)
}
test('cancel clears only password draft; no password or failed delete never clears account data', async () => {
  const ctx = context()
  let calls = 0
  ctx.serverSession = { deleteAccount: async () => { calls++; throw { code: 'INVALID_CREDENTIALS' } } }
  ctx.paliroDeleteLocalAccount = () => assert.fail('Must not delete local data')
  vm.runInContext(`${functionSource('closeAccountDeletion')}\n${functionSource('confirmAccountDeletion')}`, ctx)
  await ctx.confirmAccountDeletion()
  assert.equal(calls, 0)
  assert.equal(ctx.accountDeletionError.value, 'deletePasswordRequired')
  ctx.accountDeletionPassword.value = 'wrong'
  await ctx.confirmAccountDeletion()
  assert.equal(ctx.accountDeletionError.value, 'deletePasswordWrong')
  assert.equal(ctx.session.value.userID, 'local')
  ctx.closeAccountDeletion()
  assert.equal(ctx.accountDeletionPassword.value, '')
  assert.equal(ctx.showAccountDeletionNotice.value, false)
  assert.equal(ctx.session.value.userID, 'local')
})
test('confirmed deletion clears current data and returns to welcome, with duplicate confirmation blocked', async () => {
  const ctx = context()
  let finish, calls = 0, cleared = 0
  ctx.accountDeletionPassword.value = 'correct'
  ctx.serverSession = { deleteAccount: () => { calls++; return new Promise(resolve => { finish = resolve }) } }
  ctx.paliroDeleteLocalAccount = (localID, serverID) => { assert.equal(localID, 'local'); assert.equal(serverID, user.id); cleared++ }
  vm.runInContext(`${functionSource('closeAccountDeletion')}\n${functionSource('confirmAccountDeletion')}`, ctx)
  const pending = ctx.confirmAccountDeletion()
  await ctx.confirmAccountDeletion()
  ctx.closeAccountDeletion()
  assert.equal(ctx.showAccountDeletionNotice.value, true)
  assert.equal(calls, 1)
  assert.equal(cleared, 0)
  finish({ deleted: true, cleanupFailed: false }); await pending
  assert.equal(cleared, 1)
  assert.equal(ctx.session.value, null)
  assert.equal(ctx.route.value, 'welcome')
  assert.equal(ctx.accountNotice.value, 'accountDeleted')
  assert.equal(ctx.accountDeletionPassword.value, '')
})
