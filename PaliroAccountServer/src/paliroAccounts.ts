import { randomUUID } from 'node:crypto'
import type { PGlite } from '@electric-sql/pglite'
import { PaliroApiError } from './paliroErrors.js'
import { paliroHashPassword, paliroNewToken, paliroTokenHash, paliroVerifyPassword } from './paliroSecurity.js'

export const PALIRO_TERMS_VERSION = '2026-09-local-v1'
export const paliroInterests = ['Gaming', 'Music', 'Travel', 'Fitness', 'Movies', 'Reading', 'Photography', 'Cooking', 'Art', 'Technology', 'Fashion', 'Sports', 'Anime', 'Dancing', 'Pets', 'Nature', 'Coffee', 'Nightlife']
export interface PaliroRegistration { email: string; password: string; acceptedTerms: boolean; termsVersion: string; profile: Required<PaliroProfilePatch> }
export interface PaliroProfilePatch { nickname?: string; avatar?: string; birthday?: string; bio?: string; interests?: string[]; language?: 'en' | 'ko'; mood?: string; gender?: string }
interface PaliroUserRow {
  id: string; email: string; password_hash: string; email_verified: boolean; status: string
  nickname: string; avatar: string; birthday: string | null; bio: string; interests: string[]; language: string
  mood: string; gender: string; is_test_account: boolean
  terms_version: string; terms_accepted_at: Date; created_at: Date; updated_at: Date
}

// Return an explicit allowlist, never a database row containing password/session hashes.
function publicUser(row: PaliroUserRow) {
  return {
    id: row.id, email: row.email, emailVerified: row.email_verified, isTestAccount: row.is_test_account,
    profileComplete: Boolean(row.nickname && row.birthday),
    profile: { nickname: row.nickname, avatar: row.avatar, birthday: row.birthday, bio: row.bio, interests: row.interests, language: row.language, mood: row.mood, gender: row.gender },
    terms: { version: row.terms_version, acceptedAt: row.terms_accepted_at.toISOString() },
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
  }
}

export function paliroValidateBirthday(value: string, now: Date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new PaliroApiError(400, 'INVALID_BIRTHDAY', 'Use a valid YYYY-MM-DD birthday.')
  const date = new Date(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || value < '1900-01-01') {
    throw new PaliroApiError(400, 'INVALID_BIRTHDAY', 'Use a valid birthday from 1900 onward.')
  }
  let age = now.getUTCFullYear() - date.getUTCFullYear()
  if (now.getUTCMonth() < date.getUTCMonth() || (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate())) age -= 1
  if (age < 18) throw new PaliroApiError(400, 'AGE_RESTRICTED', 'You must be at least 18 years old.')
}

export class PaliroAccounts {
  constructor(private db: PGlite, private sessionHours = 24, private now = () => new Date()) {}

  private newSession() {
    const token = paliroNewToken()
    const createdAt = this.now()
    const expiresAt = new Date(createdAt.getTime() + this.sessionHours * 3600000)
    return { token, hash: paliroTokenHash(token), createdAt, expiresAt }
  }

  async register(input: PaliroRegistration) {
    if (!input.acceptedTerms || input.termsVersion !== PALIRO_TERMS_VERSION) {
      throw new PaliroApiError(400, 'TERMS_REQUIRED', 'Accept the current terms before registering.')
    }
    const email = input.email.trim().toLowerCase()
    if (email === 'paliro@gmail.com') throw new PaliroApiError(409, 'EMAIL_IN_USE', 'This email is reserved for the local test account.')
    const profile = { ...input.profile, nickname: input.profile.nickname.trim(), bio: input.profile.bio.trim() }
    if (!profile.nickname || !profile.bio || profile.interests.length < 3) throw new PaliroApiError(400, 'PROFILE_INCOMPLETE', 'Complete your profile and select at least three interests.')
    paliroValidateBirthday(profile.birthday, this.now())
    const passwordHash = await paliroHashPassword(input.password)
    const session = this.newSession()
    try {
      const user = await this.db.transaction(async (tx) => {
        const result = await tx.query<PaliroUserRow>(`INSERT INTO paliro_users
          (id, email, password_hash, terms_version, terms_accepted_at, created_at, updated_at,
            nickname, avatar, birthday, bio, interests, language, mood, gender)
          VALUES ($1, $2, $3, $4, $5, $5, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *, birthday::text AS birthday`,
        [randomUUID(), email, passwordHash, PALIRO_TERMS_VERSION, session.createdAt,
          profile.nickname, profile.avatar, profile.birthday, profile.bio, profile.interests, profile.language, profile.mood, profile.gender])
        const row = result.rows[0]!
        await tx.query('INSERT INTO paliro_sessions (token_hash, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)',
          [session.hash, row.id, session.createdAt, session.expiresAt])
        return publicUser(row)
      })
      return { user, accessToken: session.token, tokenType: 'Bearer', expiresAt: session.expiresAt.toISOString() }
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw new PaliroApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists.')
      throw error
    }
  }

  async login(email: string, password: string) {
    const result = await this.db.query<PaliroUserRow>('SELECT *, birthday::text AS birthday FROM paliro_users WHERE email = $1', [email.trim().toLowerCase()])
    const row = result.rows[0]
    const valid = await paliroVerifyPassword(password, row?.password_hash)
    if (!row || !valid || row.status !== 'active') throw new PaliroApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    const session = this.newSession()
    // A deletion during password verification must not recreate a session.
    const inserted = await this.db.query(`INSERT INTO paliro_sessions (token_hash, user_id, created_at, expires_at)
      SELECT $1, id, $2, $3 FROM paliro_users WHERE id = $4 AND status = 'active' RETURNING user_id`,
    [session.hash, session.createdAt, session.expiresAt, row.id])
    if (!inserted.rows.length) throw new PaliroApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    await this.db.query('DELETE FROM paliro_sessions WHERE expires_at <= $1', [session.createdAt])
    return { user: publicUser(row), accessToken: session.token, tokenType: 'Bearer', expiresAt: session.expiresAt.toISOString() }
  }

  async me(token: string) {
    const result = await this.db.query<PaliroUserRow>(`SELECT u.*, u.birthday::text AS birthday FROM paliro_users u
      JOIN paliro_sessions s ON s.user_id = u.id
      WHERE s.token_hash = $1 AND s.expires_at > $2 AND u.status = 'active'`, [paliroTokenHash(token), this.now()])
    if (!result.rows[0]) throw new PaliroApiError(401, 'UNAUTHORIZED', 'Please log in again.')
    return publicUser(result.rows[0])
  }

  async updateProfile(token: string, input: PaliroProfilePatch) {
    const user = await this.me(token)
    const patch = { ...input }
    if (patch.nickname !== undefined) {
      patch.nickname = patch.nickname.trim()
      if (!patch.nickname) throw new PaliroApiError(400, 'INVALID_NICKNAME', 'Nickname cannot be blank.')
    }
    if (patch.bio !== undefined) patch.bio = patch.bio.trim()
    if (patch.birthday !== undefined) paliroValidateBirthday(patch.birthday, this.now())
    const merged = { ...user.profile, ...patch }
    if (!merged.nickname || !merged.birthday) throw new PaliroApiError(400, 'PROFILE_INCOMPLETE', 'Provide nickname and birthday to complete your profile.')
    // Columns are fixed by the allowlist; values remain parameterized. Only patch requested fields.
    const columns = ['nickname', 'avatar', 'birthday', 'bio', 'interests', 'language', 'mood', 'gender'] as const
    const keys = columns.filter((key) => patch[key] !== undefined)
    const values: unknown[] = keys.map((key) => patch[key])
    values.push(this.now(), user.id, paliroTokenHash(token))
    const result = await this.db.query<PaliroUserRow>(`UPDATE paliro_users SET
      ${keys.map((key, index) => `${key} = $${index + 1}`).join(', ')}, updated_at = $${keys.length + 1}
      WHERE id = $${keys.length + 2} AND status = 'active' AND EXISTS (
        SELECT 1 FROM paliro_sessions WHERE token_hash = $${keys.length + 3} AND expires_at > $${keys.length + 1}
      ) RETURNING *, birthday::text AS birthday`, values)
    if (!result.rows[0]) throw new PaliroApiError(401, 'UNAUTHORIZED', 'Please log in again.')
    return publicUser(result.rows[0])
  }

  async logout(token: string) {
    await this.db.query('DELETE FROM paliro_sessions WHERE token_hash = $1', [paliroTokenHash(token)])
  }

  async deleteAccount(token: string, password: string) {
    const user = await this.me(token)
    const result = await this.db.query<{ password_hash: string }>('SELECT password_hash FROM paliro_users WHERE id = $1', [user.id])
    if (!await paliroVerifyPassword(password, result.rows[0]?.password_hash)) {
      throw new PaliroApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }
    await this.db.transaction(async tx => {
      const deleted = await tx.query(`DELETE FROM paliro_users WHERE id = $1 AND EXISTS (
        SELECT 1 FROM paliro_sessions WHERE token_hash = $2 AND expires_at > $3
      ) RETURNING id`, [user.id, paliroTokenHash(token), this.now()])
      if (!deleted.rows.length) throw new PaliroApiError(401, 'UNAUTHORIZED', 'Please log in again.')
      if (user.isTestAccount) await tx.query("INSERT INTO paliro_retired_seeds (seed_name) VALUES ('test-account') ON CONFLICT DO NOTHING")
    })
  }
}
