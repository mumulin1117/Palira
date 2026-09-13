import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { PaliroAccounts, PALIRO_TERMS_VERSION } from '../src/paliroAccounts.js'
import { paliroImportAccounts, type PaliroAccountSnapshot } from '../src/paliroLegacyImport.js'
import { paliroOpenTestDatabase } from './paliroMysqlTestDatabase.js'
import { paliroBuildApp } from '../src/paliroApp.js'

let db: Awaited<ReturnType<typeof paliroOpenTestDatabase>>
before(async () => { db = await paliroOpenTestDatabase() })
beforeEach(async () => { await db.query('DELETE FROM paliro_users'); await db.query('DELETE FROM paliro_retired_seeds') })
after(async () => { await db?.close() })

async function exportedAccount() {
  const accounts = new PaliroAccounts(db, 24, () => new Date('2026-09-13T09:00:00.123Z'))
  const session = await accounts.register({ email: 'migration@example.test', password: 'migration-only-2026', acceptedTerms: true, termsVersion: PALIRO_TERMS_VERSION,
    profile: { nickname: '별빛 탐험가', bio: 'Coffee ☕ and stars 🌟', birthday: '1998-10-24', avatar: 'violet', interests: ['Coffee', 'Music', 'Nature'], language: 'ko', gender: 'Other', mood: 'Want to Chat' } })
  await db.query("INSERT INTO paliro_retired_seeds (seed_name) VALUES ('retired-fixture')")
  const snapshot = JSON.parse(JSON.stringify({ format: 'paliro-accounts-v1', tables: {
    paliro_users: (await db.query('SELECT * FROM paliro_users')).rows,
    paliro_sessions: (await db.query('SELECT * FROM paliro_sessions')).rows,
    paliro_retired_seeds: (await db.query('SELECT * FROM paliro_retired_seeds')).rows,
  } })) as PaliroAccountSnapshot
  await db.query('DELETE FROM paliro_users')
  await db.query('DELETE FROM paliro_retired_seeds')
  return { snapshot, session, accounts }
}

test('migration retains IDs, password hashes, existing tokens, Korean, emoji, birthday and millisecond timestamps', async () => {
  const { snapshot, session, accounts } = await exportedAccount()
  assert.deepEqual(await paliroImportAccounts(db, snapshot), { paliro_users: 1, paliro_sessions: 1, paliro_retired_seeds: 1 })
  assert.deepEqual(await accounts.me(session.accessToken), session.user)
  assert.equal((await accounts.login('migration@example.test', 'migration-only-2026')).user.id, session.user.id)
  await assert.rejects(paliroImportAccounts(db, snapshot), /must be empty/)
  assert.deepEqual(await accounts.me(session.accessToken), session.user)
})

test('invalid session foreign key rolls back all imported users and sessions', async () => {
  const { snapshot } = await exportedAccount()
  snapshot.tables.paliro_sessions[0]!.user_id = '00000000-0000-4000-8000-000000000000'
  await assert.rejects(paliroImportAccounts(db, snapshot))
  for (const table of ['paliro_users', 'paliro_sessions', 'paliro_retired_seeds']) {
    assert.equal((await db.query(`SELECT * FROM ${table}`)).rows.length, 0)
  }
})

test('production proxy isolates client rate limits and rejects spoofing from untrusted peers', async () => {
  const app = await paliroBuildApp({ database: db, trustProxy: ['127.0.0.1', '::1'], authLimit: 1 })
  const login = (remoteAddress: string, forwarded: string) => app.inject({ method: 'POST', url: '/palirov1/paliro/auth/login', remoteAddress,
    headers: { 'x-forwarded-for': forwarded }, payload: { email: 'missing@example.test', password: 'unknown-password' } })
  try {
    assert.equal((await login('127.0.0.1', '192.0.2.10')).statusCode, 401)
    assert.equal((await login('127.0.0.1', '192.0.2.10')).statusCode, 429)
    assert.equal((await login('127.0.0.1', '192.0.2.11')).statusCode, 401)
    assert.equal((await login('192.0.2.12', '192.0.2.13')).statusCode, 401)
    assert.equal((await login('192.0.2.12', '192.0.2.14')).statusCode, 429)
  } finally { await app.close() }
})
