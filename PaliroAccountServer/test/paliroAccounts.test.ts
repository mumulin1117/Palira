import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { paliroOpenTestDatabase, paliroTestConfig } from './paliroMysqlTestDatabase.js'
import { paliroBuildApp } from '../src/paliroApp.js'
import { paliroOpenDatabase } from '../src/paliroDatabase.js'
import { PALIRO_TERMS_VERSION, paliroValidateBirthday } from '../src/paliroAccounts.js'
import { paliroHashPassword, paliroVerifyPassword } from '../src/paliroSecurity.js'
import { paliroReadConfig } from '../src/paliroConfig.js'
import { paliroSeedTestAccount, PALIRO_TEST_ACCOUNT_ID } from '../src/paliroTestAccount.js'

let db: Awaited<ReturnType<typeof paliroOpenDatabase>>
let app: Awaited<ReturnType<typeof paliroBuildApp>>
let now = new Date('2026-09-13T12:00:00Z')
const password = 'Paliro-test-only-2026!'
const fullProfile = () => ({ nickname: 'New Member', avatar: 'violet', birthday: '1998-10-24', bio: 'Coffee and quiet walks.', interests: ['Coffee', 'Nature', 'Music'], mood: 'Want to Chat', gender: 'Other', language: 'en' })
const registration = (email = 'member@example.test') => ({ email, password, acceptedTerms: true, termsVersion: PALIRO_TERMS_VERSION, profile: fullProfile() })
const auth = (token: string) => ({ authorization: `Bearer ${token}` })
async function register(email?: string) {
  const response = await app.inject({ method: 'POST', url: '/v1/auth/register', payload: registration(email) })
  assert.equal(response.statusCode, 201, response.body)
  return response.json()
}
before(async () => {
  db = await paliroOpenTestDatabase()
  app = await paliroBuildApp({ database: db, now: () => now, authLimit: 1000 })
})
beforeEach(async () => {
  now = new Date('2026-09-13T12:00:00Z')
  await db.query('DELETE FROM paliro_users')
  await db.query('DELETE FROM paliro_retired_seeds')
})
after(async () => { await app?.close(); await db?.close() })

test('health and interactive documentation are available without login', async () => {
  const health = await app.inject('/health')
  assert.equal(health.statusCode, 200)
  assert.equal(health.json().mode, 'development')
  assert.equal((await app.inject('/docs/')).statusCode, 200)
  const spec = (await app.inject('/openapi.json')).json()
  for (const route of ['/health', '/v1/auth/register', '/v1/auth/login', '/v1/auth/logout', '/v1/me']) assert.ok(spec.paths[route])
  assert.ok(spec.paths['/v1/me'].patch.requestBody)
  assert.deepEqual(spec.paths['/v1/me'].get.security, [{ bearerAuth: [] }])
})

test('registration persists normalized email, default avatar and hashed password/token only', async () => {
  const body = await register('  Member@Example.TEST  ')
  assert.equal(body.user.email, 'member@example.test')
  assert.equal(body.user.profile.avatar, 'violet')
  assert.deepEqual(body.user.profile, fullProfile())
  assert.equal(body.user.profileComplete, true)
  assert.equal(body.user.isTestAccount, false)
  assert.equal(body.user.emailVerified, false)
  assert.match(body.accessToken, /^[A-Za-z0-9_-]{43}$/)
  assert.equal(body.expiresAt, '2026-09-14T12:00:00.000Z')
  const row = (await db.query<{ password_hash: string }>('SELECT password_hash FROM paliro_users')).rows[0]!
  assert.ok(await paliroVerifyPassword(password, row.password_hash))
  assert.notEqual(row.password_hash, password)
  const session = (await db.query<{ token_hash: string }>('SELECT token_hash FROM paliro_sessions')).rows[0]!
  assert.match(session.token_hash, /^[a-f0-9]{64}$/)
  assert.notEqual(session.token_hash, body.accessToken)
  assert.ok(!JSON.stringify(body).includes('password'))
})

test('salts differ for identical passwords and incorrect passwords never verify', async () => {
  const first = await paliroHashPassword(password)
  const second = await paliroHashPassword(password)
  assert.notEqual(first, second)
  assert.ok(await paliroVerifyPassword(password, first))
  assert.equal(await paliroVerifyPassword('incorrect-password', first), false)
})

test('duplicate email registration is case insensitive and does not overwrite the account', async () => {
  const first = await register()
  const response = await app.inject({ method: 'POST', url: '/v1/auth/register', payload: registration('MEMBER@example.test') })
  assert.equal(response.statusCode, 409)
  assert.equal(response.json().error.code, 'EMAIL_IN_USE')
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(first.accessToken) })).json().id, first.user.id)
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 1)
})

test('concurrent duplicate registrations create exactly one user and one session', async () => {
  const results = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: '/v1/auth/register', payload: registration() })))
  assert.deepEqual(results.map((r) => r.statusCode).sort(), [201, 409])
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 1)
  assert.equal((await db.query('SELECT token_hash FROM paliro_sessions')).rows.length, 1)
})

test('registration rejects invalid fields, stale terms and unaccepted terms without writes', async () => {
  const invalid = [
    { email: 'not-an-email' }, { password: '1234567' }, { password: 'x'.repeat(129) },
    { acceptedTerms: false }, { acceptedTerms: 'true' }, { termsVersion: 'old-version' },
    { userID: 'someone-else' }, { role: 'admin' }, { email: null }, { isTestAccount: true },
    { profile: undefined }, { profile: { ...fullProfile(), interests: ['Music'] } },
    { profile: { ...fullProfile(), birthday: '2015-01-01' } },
    { profile: { ...fullProfile(), nickname: '   ' } }, { profile: { ...fullProfile(), bio: '   ' } },
    { profile: { ...fullProfile(), mood: 'invalid' } }, { profile: { ...fullProfile(), gender: 'invalid' } },
  ]
  for (const patch of invalid) {
    const result = await app.inject({ method: 'POST', url: '/v1/auth/register', payload: { ...registration(), ...patch } })
    assert.equal(result.statusCode, 400, JSON.stringify(patch))
    assert.ok(result.json().error.requestId)
  }
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 0)
})

test('login returns the same user and does not auto-create unknown accounts', async () => {
  const created = await register()
  const response = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'MEMBER@EXAMPLE.TEST', password } })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().user.id, created.user.id)
  assert.notEqual(response.json().accessToken, created.accessToken)
  const unknown = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'unknown@example.test', password } })
  const wrong = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: created.user.email, password: 'wrong-password' } })
  assert.equal(unknown.statusCode, 401)
  assert.equal(wrong.statusCode, 401)
  assert.equal(unknown.json().error.code, wrong.json().error.code)
  assert.equal(unknown.json().error.message, wrong.json().error.message)
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 1)
})

test('profile completes with adult birthday and supports Korean text and partial updates', async () => {
  const user = await register()
  const profile = { nickname: '  하늘  ', birthday: '1998-10-24', avatar: 'blue', interests: ['Coffee', 'Nature'], bio: '  조용한 산책을 좋아해요.  ', language: 'ko' }
  const response = await app.inject({ method: 'PATCH', url: '/v1/me', headers: auth(user.accessToken), payload: profile })
  assert.equal(response.statusCode, 200, response.body)
  assert.equal(response.json().profileComplete, true)
  assert.equal(response.json().profile.nickname, '하늘')
  assert.equal(response.json().profile.bio, profile.bio.trim())
  const updated = await app.inject({ method: 'PATCH', url: '/v1/me', headers: auth(user.accessToken), payload: { language: 'en', bio: '' } })
  assert.equal(updated.statusCode, 200)
  assert.equal(updated.json().profile.nickname, '하늘')
  assert.equal(updated.json().profile.birthday, '1998-10-24')
  assert.equal(updated.json().profile.bio, '')
  assert.equal(updated.json().profile.language, 'en')
})

test('invalid profile edits and underage birthdays are rejected without partial writes', async () => {
  const user = await register()
  const base = { nickname: 'Demo', birthday: '1998-10-24' }
  const invalid = [
    {}, { ...base, nickname: '   ' }, { ...base, nickname: 'x'.repeat(33) },
    { ...base, birthday: '2010-01-01' }, { ...base, birthday: '2026-09-14' }, { ...base, birthday: '2000-02-30' },
    { ...base, birthday: '1899-01-01' }, { ...base, birthday: null }, { ...base, avatar: '/uploaded.png' },
    { ...base, bio: 'x'.repeat(281) }, { ...base, language: 'zh' }, { ...base, interests: ['Unknown'] },
    { ...base, interests: ['Coffee', 'Coffee'] }, { ...base, interests: Array(21).fill('Music') },
    { ...base, email: 'takeover@example.test' }, { ...base, id: 'someone-else' },
  ]
  for (const payload of invalid) {
    const result = await app.inject({ method: 'PATCH', url: '/v1/me', headers: auth(user.accessToken), payload })
    assert.equal(result.statusCode, 400, JSON.stringify(payload))
  }
  assert.deepEqual((await app.inject({ url: '/v1/me', headers: auth(user.accessToken) })).json(), user.user)
})

test('adult cutoff and leap-day validation use UTC calendar dates', () => {
  assert.doesNotThrow(() => paliroValidateBirthday('2008-09-13', now))
  assert.throws(() => paliroValidateBirthday('2008-09-14', now), /18/)
  assert.doesNotThrow(() => paliroValidateBirthday('2004-02-29', now))
  assert.throws(() => paliroValidateBirthday('2003-02-29', now), /birthday/)
})

test('two accounts cannot read or update each other; SQL-like input remains text', async () => {
  const a = await register('a@example.test')
  const b = await register('b@example.test')
  const nickname = "Robert'); DROP TABLE x;"
  const updated = await app.inject({ method: 'PATCH', url: '/v1/me', headers: auth(a.accessToken), payload: { nickname, birthday: '1998-10-24' } })
  assert.equal(updated.statusCode, 200)
  assert.equal(updated.json().profile.nickname, nickname)
  const other = (await app.inject({ url: '/v1/me', headers: auth(b.accessToken) })).json()
  assert.equal(other.id, b.user.id)
  assert.equal(other.profile.nickname, fullProfile().nickname)
  assert.equal((await app.inject({ url: `/v1/users/${a.user.id}`, headers: auth(b.accessToken) })).statusCode, 404)
})

test('missing, forged, expired and revoked sessions cannot read or mutate profiles', async () => {
  const user = await register()
  for (const headers of [{}, auth('x'.repeat(43)), { authorization: 'Bearer bad' }]) {
    assert.equal((await app.inject({ url: '/v1/me', headers })).statusCode, 401)
    assert.equal((await app.inject({ method: 'PATCH', url: '/v1/me', headers, payload: { nickname: 'Demo', birthday: '1998-10-24' } })).statusCode, 401)
  }
  now = new Date(user.expiresAt)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(user.accessToken) })).statusCode, 401)
  now = new Date('2026-09-13T12:00:00Z')
  const logout = await app.inject({ method: 'POST', url: '/v1/auth/logout', headers: auth(user.accessToken) })
  assert.equal(logout.statusCode, 204)
  assert.equal(logout.body, '')
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(user.accessToken) })).statusCode, 401)
})

test('logout is idempotent, leaves the profile and does not revoke another device', async () => {
  const user = await register()
  const login = (await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: user.user.email, password } })).json()
  for (let i = 0; i < 2; i++) assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/logout', headers: auth(user.accessToken) })).statusCode, 204)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(login.accessToken) })).statusCode, 200)
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 1)
})

test('disabled accounts cannot authenticate or keep using an existing session', async () => {
  const user = await register()
  await db.query("UPDATE paliro_users SET status = 'disabled' WHERE id = $1", [user.user.id])
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(user.accessToken) })).statusCode, 401)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: user.user.email, password } })).statusCode, 401)
})

test('deletion requires password confirmation, cascades sessions and leaves other users untouched', async () => {
  const a = await register('a@example.test')
  const b = await register('b@example.test')
  const wrong = await app.inject({ method: 'DELETE', url: '/v1/me', headers: auth(a.accessToken), payload: { password: 'wrong-password' } })
  assert.equal(wrong.statusCode, 401)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(a.accessToken) })).statusCode, 200)
  const deleted = await app.inject({ method: 'DELETE', url: '/v1/me', headers: auth(a.accessToken), payload: { password } })
  assert.equal(deleted.statusCode, 204)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(a.accessToken) })).statusCode, 401)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(b.accessToken) })).statusCode, 200)
  assert.equal((await db.query('SELECT user_id FROM paliro_sessions WHERE user_id = $1', [a.user.id])).rows.length, 0)
})

test('CORS, malformed JSON, size limits and security headers have explicit behavior', async () => {
  const allowed = await app.inject({ url: '/health', headers: { origin: 'capacitor://localhost' } })
  assert.equal(allowed.headers['access-control-allow-origin'], 'capacitor://localhost')
  assert.equal((await app.inject({ url: '/health', headers: { origin: 'http://127.0.0.1:3001' } })).statusCode, 200)
  const denied = await app.inject({ method: 'POST', url: '/v1/auth/register', headers: { origin: 'https://untrusted.example' }, payload: registration() })
  assert.equal(denied.statusCode, 403)
  assert.equal(denied.json().error.code, 'ORIGIN_NOT_ALLOWED')
  assert.equal(allowed.headers['cache-control'], 'no-store')
  assert.equal(allowed.headers['x-content-type-options'], 'nosniff')
  const malformed = await app.inject({ method: 'POST', url: '/v1/auth/login', headers: { 'content-type': 'application/json' }, payload: '{bad' })
  assert.equal(malformed.statusCode, 400)
  const oversized = await app.inject({ method: 'POST', url: '/v1/auth/register', payload: { ...registration(), password: 'x'.repeat(17000) } })
  assert.equal(oversized.statusCode, 413)
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 0)
})

test('auth rate limiting rejects repeated guesses and does not trust spoofed forwarding headers', async () => {
  const limited = await paliroBuildApp({ database: db, authLimit: 2 })
  try {
    for (let i = 0; i < 2; i++) {
      assert.equal((await limited.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'unknown@example.test', password } })).statusCode, 401)
    }
    const result = await limited.inject({ method: 'POST', url: '/v1/auth/login', headers: { 'x-forwarded-for': '1.2.3.4' }, payload: { email: 'unknown@example.test', password } })
    assert.equal(result.statusCode, 429)
    assert.equal(result.json().error.code, 'RATE_LIMITED')
    assert.ok(result.headers['retry-after'])
  } finally { await limited.close() }
})

test('MySQL survives reconnecting and does not reapply migrations or reset users', async () => {
  let disk = await paliroOpenDatabase(paliroTestConfig(), true)
  let server = await paliroBuildApp({ database: disk })
  try {
    const registered = await server.inject({ method: 'POST', url: '/v1/auth/register', payload: registration('disk@example.test') })
    assert.equal(registered.statusCode, 201)
    const session = registered.json()
    const profile = { nickname: 'Disk User', birthday: '1998-10-24', language: 'en' }
    assert.equal((await server.inject({ method: 'PATCH', url: '/v1/me', headers: auth(session.accessToken), payload: profile })).statusCode, 200)
    await server.close()
    await disk.close()
    disk = await paliroOpenDatabase(paliroTestConfig(), true)
    server = await paliroBuildApp({ database: disk })
    const restored = await server.inject({ url: '/v1/me', headers: auth(session.accessToken) })
    assert.equal(restored.statusCode, 200)
    assert.equal(restored.json().id, session.user.id)
    assert.equal(restored.json().profile.nickname, profile.nickname)
    const login = await server.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'disk@example.test', password } })
    assert.equal(login.statusCode, 200)
    assert.equal((await disk.query('SELECT version FROM paliro_schema_migrations')).rows.length, 1)
  } finally { await server.close(); await disk.close() }
})

test('configuration keeps development local and enables only constrained production mode', () => {
  const mysqlEnv = { PALIRO_MYSQL_USER: 'paliro_test', PALIRO_MYSQL_PASSWORD: 'config-test-only' }
  assert.equal(paliroReadConfig(mysqlEnv).host, '127.0.0.1')
  const production = paliroReadConfig({ ...mysqlEnv, NODE_ENV: 'production', PORT: '3300', PALIRO_PUBLIC_ORIGIN: 'https://mobile.paliroweb.site' })
  assert.equal(production.mode, 'production')
  assert.deepEqual(production.corsOrigins, ['https://mobile.paliroweb.site', 'capacitor://localhost'])
  assert.deepEqual(production.trustProxy, ['127.0.0.1', '::1'])
  for (const env of [{ NODE_ENV: 'production' }, { NODE_ENV: 'production', PALIRO_PUBLIC_ORIGIN: 'http://mobile.paliroweb.site' }, { NODE_ENV: 'production', PALIRO_PUBLIC_ORIGIN: 'https://mobile.paliroweb.site/path' }, { NODE_ENV: 'staging' }, { HOST: '0.0.0.0' }, { PORT: 'abc' }, { PORT: '0' }, { PALIRO_SESSION_HOURS: '-1' }, { PALIRO_CORS_ORIGINS: '*' }, { PALIRO_MYSQL_DATABASE: 'other_project' }, { PALIRO_MYSQL_PASSWORD: '' }, { PALIRO_MYSQL_PORT: '0' }, { PALIRO_MYSQL_HOST: 'public.example' }]) {
    assert.throws(() => paliroReadConfig({ ...mysqlEnv, ...env }))
  }
})

test('the seeded account uses its configured password and retains a stable fixture identity', async () => {
  await paliroSeedTestAccount(db)
  const login = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'PALIRO@gmail.com', password: '67896789' } })
  assert.equal(login.statusCode, 200, login.body)
  const result = login.json()
  assert.equal(result.user.id, PALIRO_TEST_ACCOUNT_ID)
  assert.equal(result.user.isTestAccount, true)
  assert.equal(result.user.profileComplete, true)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '123456' } })).statusCode, 401)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/register', payload: { ...registration(), password: '123456' } })).statusCode, 400)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/register', payload: registration('paliro@gmail.com') })).statusCode, 409)
  await db.query("UPDATE paliro_users SET nickname = 'Keep my changes' WHERE id = $1", [PALIRO_TEST_ACCOUNT_ID])
  await paliroSeedTestAccount(db)
  const restored = await app.inject({ url: '/v1/me', headers: auth(result.accessToken) })
  assert.equal(restored.json().profile.nickname, 'Keep my changes')
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 1)
})

test('production protection prevents deletion of the shared acceptance account', async () => {
  await paliroSeedTestAccount(db)
  const protectedApp = await paliroBuildApp({ database: db, protectTestAccount: true, authLimit: 1000 })
  try {
    const login = await protectedApp.inject({ method: 'POST', url: '/palirov1/paliro/auth/login', payload: { email: 'paliro@gmail.com', password: '67896789' } })
    assert.equal(login.statusCode, 200)
    const token = login.json().accessToken
    const deletion = await protectedApp.inject({ method: 'DELETE', url: '/palirov1/paliro/me/account', headers: auth(token), payload: { password: '67896789' } })
    assert.equal(deletion.statusCode, 403)
    assert.equal(deletion.json().error.code, 'TEST_ACCOUNT_PROTECTED')
    assert.equal((await protectedApp.inject({ url: '/palirov1/paliro/me/profile', headers: auth(token) })).statusCode, 200)
  } finally { await protectedApp.close() }
})

test('rotating the existing test password preserves user data, revokes only its sessions and is idempotent', async () => {
  await paliroSeedTestAccount(db)
  await db.query("UPDATE paliro_users SET password_hash = $1, nickname = 'Keep my profile' WHERE id = $2", [await paliroHashPassword('678678'), PALIRO_TEST_ACCOUNT_ID])
  const oldLogin = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '678678' } })
  assert.equal(oldLogin.statusCode, 200)
  const old = oldLogin.json()
  const other = await register('preserve@example.test')
  await paliroSeedTestAccount(db)
  const failed = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '678678' } })
  assert.equal(failed.statusCode, 401)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(old.accessToken) })).statusCode, 401)
  const currentLogin = await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '67896789' } })
  assert.equal(currentLogin.statusCode, 200)
  const current = currentLogin.json()
  assert.equal(current.user.id, old.user.id)
  assert.deepEqual(current.user.profile, old.user.profile)
  await paliroSeedTestAccount(db)
  assert.equal((await app.inject({ url: '/v1/me', headers: auth(current.accessToken) })).statusCode, 200)
  assert.deepEqual((await app.inject({ url: '/v1/me', headers: auth(other.accessToken) })).json(), other.user)
})

test('a deleted test account is not recreated by the startup seeder', async () => {
  await paliroSeedTestAccount(db)
  const login = (await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '67896789' } })).json()
  assert.equal((await app.inject({ method: 'DELETE', url: '/v1/me', headers: auth(login.accessToken), payload: { password: 'wrong-password' } })).statusCode, 401)
  assert.equal((await db.query('SELECT * FROM paliro_retired_seeds')).rows.length, 0)
  assert.equal((await app.inject({ method: 'DELETE', url: '/v1/me', headers: auth(login.accessToken), payload: { password: '67896789' } })).statusCode, 204)
  await paliroSeedTestAccount(db)
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 0)
  assert.equal((await db.query('SELECT token_hash FROM paliro_sessions')).rows.length, 0)
  assert.equal((await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '67896789' } })).statusCode, 401)
})
