import { createPool, type PoolConnection, type ResultSetHeader } from 'mysql2/promise'
import type { PaliroMysqlConfig } from './paliroConfig.js'

export interface PaliroQuery {
  query<T = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[]; affectedRows: number }>
}
export interface PaliroDatabase extends PaliroQuery {
  transaction<T>(callback: (tx: PaliroQuery) => Promise<T>): Promise<T>
  close(): Promise<void>
}

export const paliroMigrations = [{ version: 1, statements: [
  `CREATE TABLE IF NOT EXISTS paliro_users (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(512) CHARACTER SET ascii NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    nickname VARCHAR(128) NOT NULL DEFAULT '',
    avatar ENUM('violet', 'blue', 'coral', 'mint', 'golden') NOT NULL DEFAULT 'violet',
    birthday DATE NULL,
    bio VARCHAR(1120) NOT NULL DEFAULT '',
    interests JSON NOT NULL,
    language ENUM('en', 'ko') NOT NULL DEFAULT 'ko',
    mood VARCHAR(64) NOT NULL DEFAULT 'Want to Chat',
    gender ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other',
    is_test_account BOOLEAN NOT NULL DEFAULT false,
    terms_version VARCHAR(64) NOT NULL,
    terms_accepted_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL
  ) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
  `CREATE TABLE IF NOT EXISTS paliro_sessions (
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    created_at DATETIME(3) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    INDEX paliro_sessions_user_id (user_id),
    INDEX paliro_sessions_expiry (expires_at),
    CONSTRAINT paliro_session_user FOREIGN KEY (user_id) REFERENCES paliro_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
  `CREATE TABLE IF NOT EXISTS paliro_retired_seeds (
    seed_name VARCHAR(64) PRIMARY KEY
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
] }]

function queryClient(connection: PoolConnection): PaliroQuery {
  return { async query<T>(sql: string, values: unknown[] = []) {
    // Convert repository bindings to mysql2 prepared parameters; values never enter SQL text.
    const parameters: (string | number | boolean | Date | null)[] = []
    const statement = sql.replace(/\$(\d+)/g, (_match, index: string) => {
      const value = values[Number(index) - 1]
      if (!(value === null || value instanceof Date || Array.isArray(value) || ['string', 'number', 'boolean'].includes(typeof value))) throw new Error('Invalid SQL parameter')
      parameters.push(Array.isArray(value) ? JSON.stringify(value) : value as string | number | boolean | Date | null)
      return '?'
    })
    const [result] = await connection.execute(statement, parameters)
    if (!Array.isArray(result)) return { rows: [] as T[], affectedRows: (result as ResultSetHeader).affectedRows }
    const rows = result.map(value => {
      const row = { ...value } as Record<string, unknown>
      for (const field of ['email_verified', 'is_test_account']) {
        if (field in row) row[field] = Boolean(row[field])
      }
      if (typeof row.interests === 'string') row.interests = JSON.parse(row.interests)
      return row as T
    })
    return { rows, affectedRows: 0 }
  } }
}

export async function paliroOpenDatabase(config: PaliroMysqlConfig, migrate = false): Promise<PaliroDatabase> {
  const pool = createPool({ ...config, connectionLimit: 4, maxIdle: 4, idleTimeout: 60000,
    charset: 'utf8mb4', timezone: 'Z', dateStrings: ['DATE'], multipleStatements: false,
    connectTimeout: 10000, waitForConnections: true, queueLimit: 64 })
  async function connection() {
    const client = await pool.getConnection()
    try {
      await client.query("SET time_zone = '+00:00'")
      await client.query("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'")
      return client
    } catch (error) { client.release(); throw error }
  }
  try {
    const client = await connection()
    try {
      if (migrate) {
        const tx = queryClient(client)
        const lockName = `paliro-schema:${config.database}`
        const lock = await tx.query<{ acquired: number }>('SELECT GET_LOCK($1, 30) AS acquired', [lockName])
        if (lock.rows[0]?.acquired !== 1) throw new Error('Paliro schema migration is busy')
        try {
          await client.query(`CREATE TABLE IF NOT EXISTS paliro_schema_migrations (
            version INTEGER PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
          ) ENGINE=InnoDB`)
          const applied = await tx.query<{ version: number }>('SELECT version FROM paliro_schema_migrations')
          if (applied.rows.some(row => row.version > paliroMigrations.at(-1)!.version)) throw new Error('Database schema is newer than this server')
          // MySQL DDL commits implicitly: retry statements before recording the migration version.
          for (const migration of paliroMigrations) {
            if (applied.rows.some(row => row.version === migration.version)) continue
            for (const statement of migration.statements) await client.query(statement)
            await tx.query('INSERT INTO paliro_schema_migrations (version) VALUES ($1)', [migration.version])
          }
        } finally { await tx.query('SELECT RELEASE_LOCK($1)', [lockName]) }
      }
      const applied = await queryClient(client).query<{ version: number }>('SELECT version FROM paliro_schema_migrations ORDER BY version')
      if (JSON.stringify(applied.rows.map(row => row.version)) !== JSON.stringify(paliroMigrations.map(row => row.version))) {
        throw new Error('Run the Paliro MySQL migrations before starting this release')
      }
    } finally { client.release() }
  } catch (error) { await pool.end(); throw error }
  return {
    async query<T>(sql: string, values?: unknown[]) {
      const client = await connection()
      try { return await queryClient(client).query<T>(sql, values) } finally { client.release() }
    },
    async transaction<T>(callback: (tx: PaliroQuery) => Promise<T>) {
      const client = await connection()
      try {
        await client.beginTransaction()
        const result = await callback(queryClient(client))
        await client.commit()
        return result
      } catch (error) { await client.rollback(); throw error } finally { client.release() }
    },
    close: () => pool.end(),
  }
}
