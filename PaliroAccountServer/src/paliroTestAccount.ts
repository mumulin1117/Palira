import type { PaliroDatabase } from './paliroDatabase.js'
import { paliroHashPassword, paliroVerifyPassword } from './paliroSecurity.js'
import { PALIRO_TERMS_VERSION } from './paliroAccounts.js'

export const PALIRO_TEST_ACCOUNT_ID = '80962768-0000-4000-8000-000000000001'
export const PALIRO_TEST_ACCOUNT_EMAIL = 'paliro@gmail.com'
const PALIRO_TEST_ACCOUNT_PASSWORD = '67896789'

export async function paliroSeedTestAccount(db: PaliroDatabase) {
  if ((await db.query("SELECT seed_name FROM paliro_retired_seeds WHERE seed_name = 'test-account'")).rows.length) return
  const existing = await db.query<{ id: string; is_test_account: boolean; password_hash: string }>('SELECT id, is_test_account, password_hash FROM paliro_users WHERE email = $1 OR id = $2', [PALIRO_TEST_ACCOUNT_EMAIL, PALIRO_TEST_ACCOUNT_ID])
  if (existing.rows.length) {
    if (existing.rows.length !== 1 || existing.rows[0]!.id !== PALIRO_TEST_ACCOUNT_ID || !existing.rows[0]!.is_test_account) {
      throw new Error('The reserved local test identity conflicts with an existing account. No data was overwritten.')
    }
    if (!await paliroVerifyPassword(PALIRO_TEST_ACCOUNT_PASSWORD, existing.rows[0]!.password_hash)) {
      const passwordHash = await paliroHashPassword(PALIRO_TEST_ACCOUNT_PASSWORD)
      // Rotate only this reserved credential; never recreate the user or reset their profile.
      await db.transaction(async (tx) => {
        await tx.query('UPDATE paliro_users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, PALIRO_TEST_ACCOUNT_ID])
        await tx.query('DELETE FROM paliro_sessions WHERE user_id = $1', [PALIRO_TEST_ACCOUNT_ID])
      })
    }
    return
  }
  await db.query(`INSERT INTO paliro_users (id, email, password_hash, nickname, avatar, birthday, bio, interests, language,
    mood, gender, is_test_account, terms_version, terms_accepted_at, created_at, updated_at)
    VALUES ($1, $2, $3, 'Cosmic Explorer', 'violet', '1998-10-24', 'Opening a new box and seeing where it leads.',
    JSON_ARRAY('Music', 'Travel', 'Gaming'), 'ko', 'Ready for Fun', 'Other', true, $4, now(), now(), now())`,
  [PALIRO_TEST_ACCOUNT_ID, PALIRO_TEST_ACCOUNT_EMAIL, await paliroHashPassword(PALIRO_TEST_ACCOUNT_PASSWORD), PALIRO_TERMS_VERSION])
}
