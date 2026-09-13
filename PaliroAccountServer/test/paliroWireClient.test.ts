import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { paliroBuildApp } from '../src/paliroApp.js'
import { paliroOpenDatabase } from '../src/paliroDatabase.js'
import { paliroOpenTestDatabase } from './paliroMysqlTestDatabase.js'
import { paliroSeedTestAccount, PALIRO_TEST_ACCOUNT_ID } from '../src/paliroTestAccount.js'
import { createPaliroAccountApi } from '../../ParamoboaxsDak/src/services/paliroAccountApi.js'

const prefix = '/palirov1/paliro'
const password = 'Paliro-wire-test-2026!'
const profile = { nickname: 'Wire Member', avatar: 'blue', birthday: '1998-10-24', bio: 'Coffee and music.', interests: ['Coffee', 'Music', 'Nature'], mood: 'Want to Chat', gender: 'Other', language: 'ko' }
const wireProfile = { palirovdisplayName: 'Wire Member', palirovavatarKey: 'blue', palirovbirthDate: '1998-10-24', palirovaboutMe: 'Coffee and music.', palirovinterestTags: ['Coffee', 'Music', 'Nature'], palirovcurrentMood: 'Want to Chat', gender: 'Other', palirovpreferredLanguage: 'ko' }
let db: Awaited<ReturnType<typeof paliroOpenDatabase>>
let app: Awaited<ReturnType<typeof paliroBuildApp>>
const calls: { url: string; method: string; body: any }[] = []
const headers = (token: string) => ({ authorization: `Bearer ${token}` })
const api = createPaliroAccountApi({ fetchImpl: async (url: string, options: any) => {
  const path = new URL(url).pathname
  calls.push({ url: path, method: options.method, body: options.body && JSON.parse(options.body) })
  const response = await app.inject({ url: path, method: options.method, headers: options.headers, payload: options.body })
  return new Response(response.statusCode === 204 ? null : response.body, { status: response.statusCode, headers: { 'Content-Type': 'application/json' } })
} })
before(async () => {
  db = await paliroOpenTestDatabase()
  app = await paliroBuildApp({ database: db, authLimit: 1000 })
})
after(async () => { await app?.close(); await db?.close() })

test('real client and server complete branded registration, profile edits, logout and deletion', async () => {
  const session = await api.register({ email: 'wire@example.test', password }, profile, 'ko', true)
  assert.deepEqual(calls.at(-1), { url: `${prefix}/auth/register`, method: 'POST', body: {
    email: 'wire@example.test', password, acceptedTerms: true, termsVersion: '2026-09-local-v1', palirovmemberProfile: wireProfile,
  } })
  assert.deepEqual(session.user.profile, profile)
  assert.equal(session.user.profileComplete, true)
  assert.equal(session.user.isTestAccount, false)
  const raw = (await app.inject({ url: `${prefix}/me/profile`, headers: headers(session.accessToken) })).json()
  assert.deepEqual(raw.palirovmemberProfile, wireProfile)
  assert.equal(raw.profile, undefined)
  assert.equal(raw.password, undefined)
  assert.deepEqual((await api.me(session.accessToken)).profile, profile)

  const updated = await api.updateProfile(session.accessToken, { nickname: 'Updated', bio: '', interests: [], language: 'en', photoDataUrl: 'local-only' })
  assert.deepEqual(calls.at(-1), { url: `${prefix}/me/profile`, method: 'PATCH', body: {
    palirovdisplayName: 'Updated', palirovaboutMe: '', palirovinterestTags: [], palirovpreferredLanguage: 'en',
  } })
  assert.deepEqual(updated.profile, { ...profile, nickname: 'Updated', bio: '', interests: [], language: 'en' })
  const legacy = (await app.inject({ url: '/v1/me', headers: headers(session.accessToken) })).json()
  assert.deepEqual(legacy, updated)
  assert.equal(legacy.palirovmemberProfile, undefined)

  await api.logout(session.accessToken)
  assert.equal(calls.at(-1)?.url, `${prefix}/auth/logout`)
  await assert.rejects(api.me(session.accessToken), { code: 'UNAUTHORIZED' })
  const login = await api.login('WIRE@example.test', password)
  assert.equal(calls.at(-1)?.url, `${prefix}/auth/login`)
  assert.equal(login.user.id, session.user.id)
  assert.deepEqual(login.user.profile, updated.profile)
  await assert.rejects(api.deleteAccount(login.accessToken, 'incorrect-password'), { code: 'INVALID_CREDENTIALS' })
  assert.equal((await api.me(login.accessToken)).id, session.user.id)
  await api.deleteAccount(login.accessToken, password)
  assert.deepEqual(calls.at(-1), { url: `${prefix}/me/account`, method: 'DELETE', body: { password } })
  await assert.rejects(api.me(login.accessToken), { code: 'UNAUTHORIZED' })
  await assert.rejects(api.login('wire@example.test', password), { code: 'INVALID_CREDENTIALS' })
})

test('new contract rejects legacy names, spoofed identity and incomplete or underage registration', async () => {
  const base = { email: 'invalid@example.test', password, acceptedTerms: true, termsVersion: '2026-09-local-v1', palirovmemberProfile: wireProfile }
  for (const payload of [
    { ...base, profile }, { ...base, isTestAccount: true },
    { ...base, palirovmemberProfile: profile }, { ...base, palirovmemberProfile: undefined },
    { ...base, palirovmemberProfile: { ...wireProfile, palirovbirthDate: '2020-01-01' } },
    { ...base, palirovmemberProfile: { ...wireProfile, palirovinterestTags: ['Coffee'] } },
  ]) {
    assert.equal((await app.inject({ method: 'POST', url: `${prefix}/auth/register`, payload })).statusCode, 400)
  }
  assert.equal((await db.query('SELECT id FROM paliro_users')).rows.length, 0)
})

test('test-account identity and existing sessions work across contracts without changing stored data', async () => {
  await paliroSeedTestAccount(db)
  const legacy = (await app.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: 'paliro@gmail.com', password: '67896789' } })).json()
  const current = await api.me(legacy.accessToken)
  assert.deepEqual(current, legacy.user)
  assert.equal(current.id, PALIRO_TEST_ACCOUNT_ID)
  assert.equal(current.isTestAccount, true)
  const login = await api.login('paliro@gmail.com', '67896789')
  assert.deepEqual(login.user, current)
  for (const payload of [{ nickname: 'Wrong contract' }, { palirovmemberProfile: { palirovdisplayName: 'Wrapped' } }, { id: 'other' }]) {
    assert.equal((await app.inject({ method: 'PATCH', url: `${prefix}/me/profile`, headers: headers(login.accessToken), payload })).statusCode, 400)
  }
  assert.deepEqual(await api.me(login.accessToken), current)
})

test('new and legacy aliases share login attempt limits', async () => {
  const limited = await paliroBuildApp({ database: db, authLimit: 2 })
  try {
    for (const base of ['/v1', prefix]) {
      assert.equal((await limited.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'unknown@example.test', password } })).statusCode, 401)
    }
    assert.equal((await limited.inject({ method: 'POST', url: `${prefix}/auth/login`, payload: { email: 'unknown@example.test', password } })).statusCode, 429)
  } finally { await limited.close() }
})

test('OpenAPI advertises the new contract and marks legacy operations deprecated', async () => {
  const spec = (await app.inject('/openapi.json')).json()
  for (const [path, methods] of Object.entries({ '/auth/register': ['post'], '/auth/login': ['post'], '/auth/logout': ['post'], '/me/profile': ['get', 'patch'], '/me/account': ['delete'] })) {
    for (const method of methods) {
      const operation = spec.paths[`${prefix}${path}`][method]
      assert.ok(operation)
      assert.notEqual(operation.deprecated, true)
    }
  }
  assert.equal(spec.paths['/v1/me'].get.deprecated, true)
  const schema = spec.paths[`${prefix}/auth/register`].post.requestBody.content['application/json'].schema
  assert.ok(schema.required.includes('palirovmemberProfile'))
  assert.deepEqual(Object.keys(schema.properties.palirovmemberProfile.properties).sort(), Object.keys(wireProfile).sort())
})

test('client rejects stale legacy-only profile responses instead of caching an empty profile', async () => {
  const stale = createPaliroAccountApi({ fetchImpl: async () => new Response(JSON.stringify({ id: 'old', profile })) })
  await assert.rejects(stale.me('token'), { code: 'INVALID_RESPONSE' })
})
