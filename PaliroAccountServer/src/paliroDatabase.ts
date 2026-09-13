import { PGlite } from '@electric-sql/pglite'

export const paliroMigrations = [{
  version: 1,
  sql: `
    CREATE TABLE paliro_users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE CHECK (email = lower(trim(email))),
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
      nickname TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT 'violet' CHECK (avatar IN ('violet', 'blue', 'coral', 'mint', 'golden')),
      birthday DATE,
      bio TEXT NOT NULL DEFAULT '',
      interests TEXT[] NOT NULL DEFAULT '{}',
      language TEXT NOT NULL DEFAULT 'ko' CHECK (language IN ('en', 'ko')),
      terms_version TEXT NOT NULL,
      terms_accepted_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE paliro_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES paliro_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX paliro_sessions_user_id ON paliro_sessions(user_id);
    CREATE INDEX paliro_sessions_expiry ON paliro_sessions(expires_at);
  `,
}, {
  version: 2,
  sql: `ALTER TABLE paliro_users ADD COLUMN mood TEXT NOT NULL DEFAULT 'Want to Chat';
    ALTER TABLE paliro_users ADD COLUMN gender TEXT NOT NULL DEFAULT 'Other' CHECK (gender IN ('Male', 'Female', 'Other'));
    ALTER TABLE paliro_users ADD COLUMN is_test_account BOOLEAN NOT NULL DEFAULT false;`,
}, {
  version: 3,
  sql: 'CREATE TABLE paliro_retired_seeds (seed_name TEXT PRIMARY KEY);',
}]

export async function paliroOpenDatabase(dataDir?: string) {
  const db = new PGlite(dataDir)
  try {
    await db.waitReady
    await db.exec(`CREATE TABLE IF NOT EXISTS paliro_schema_migrations (
      version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
    const applied = await db.query<{ version: number }>('SELECT version FROM paliro_schema_migrations')
    if (applied.rows.some((row) => row.version > paliroMigrations.at(-1)!.version)) {
      throw new Error('Database schema is newer than this server. Do not downgrade without a compatible migration.')
    }
    for (const migration of paliroMigrations) {
      if (applied.rows.some((row) => row.version === migration.version)) continue
      await db.transaction(async (tx) => {
        await tx.exec(migration.sql)
        await tx.query('INSERT INTO paliro_schema_migrations (version) VALUES ($1)', [migration.version])
      })
    }
    return db
  } catch (error) {
    await db.close()
    throw error
  }
}
