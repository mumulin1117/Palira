import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = process.env.PALIRO_API_URL ?? 'http://127.0.0.1:3001'
const url = new URL(base)
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('This smoke test may only target a local server.')
const email = `smoke-${randomUUID()}@example.test`
const password = `Local-test-${randomUUID()}`
let token = ''
async function request(path, method = 'GET', body) {
  return fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(15000), headers: {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, ...(body ? { body: JSON.stringify(body) } : {}) })
}
try {
  assert.equal((await request('/health')).status, 200)
  const registration = await request('/v1/auth/register', 'POST', { email, password, acceptedTerms: true, termsVersion: '2026-09-local-v1',
    profile: { nickname: 'Local Smoke', avatar: 'violet', birthday: '1998-10-24', bio: 'Coffee and quiet walks.', interests: ['Music', 'Coffee', 'Nature'], mood: 'Want to Chat', gender: 'Other', language: 'en' } })
  assert.equal(registration.status, 201, await registration.clone().text())
  const registered = await registration.json()
  token = registered.accessToken
  assert.equal(registered.user.profileComplete, true)
  assert.equal((await request('/v1/me')).status, 200)
  const updated = await request('/v1/me', 'PATCH', { nickname: 'Local Smoke', birthday: '1998-10-24', avatar: 'violet', language: 'en', interests: ['Coffee'] })
  assert.equal(updated.status, 200)
  assert.equal((await updated.json()).profileComplete, true)
  assert.equal((await request('/v1/auth/logout', 'POST')).status, 204)
  assert.equal((await request('/v1/me')).status, 401)
  token = ''
  const login = await request('/v1/auth/login', 'POST', { email, password })
  assert.equal(login.status, 200)
  const loggedIn = await login.json()
  token = loggedIn.accessToken
  assert.equal(loggedIn.user.id, registered.user.id)
  assert.equal(loggedIn.user.profile.nickname, 'Local Smoke')
  console.log('PASS: health, register, read/update profile, logout, revoked token, login again with persisted profile.')
} finally {
  if (!token) {
    const login = await request('/v1/auth/login', 'POST', { email, password }).catch(() => null)
    if (login?.ok) token = (await login.json()).accessToken
  }
  if (token) {
    const deleted = await request('/v1/me', 'DELETE', { password })
    assert.equal(deleted.status, 204, 'Could not clean up the uniquely-created smoke account.')
    console.log('PASS: deleted only the smoke account created by this run.')
  }
}
