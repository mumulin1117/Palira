import { createHash } from 'node:crypto'
import type { PaliroDatabase } from './paliroDatabase.js'

const columns = {
  paliro_users: ['id', 'email', 'password_hash', 'email_verified', 'status', 'nickname', 'avatar', 'birthday', 'bio', 'interests', 'language', 'mood', 'gender', 'is_test_account', 'terms_version', 'terms_accepted_at', 'created_at', 'updated_at'],
  paliro_sessions: ['token_hash', 'user_id', 'created_at', 'expires_at'],
  paliro_retired_seeds: ['seed_name'],
}
type Table = keyof typeof columns
export type PaliroAccountSnapshot = { format: string; tables: Record<Table, Record<string, unknown>[]> }
const dates = new Set(['terms_accepted_at', 'created_at', 'updated_at', 'expires_at'])
function digest(table: Table, rows: Record<string, unknown>[]) {
  const normalized = rows.map(row => columns[table].map(column => row[column] instanceof Date ? (row[column] as Date).toISOString() : row[column]))
  normalized.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

export async function paliroImportAccounts(db: PaliroDatabase, snapshot: PaliroAccountSnapshot) {
  if (snapshot.format !== 'paliro-accounts-v1') throw new Error('Unsupported account export format')
  return db.transaction(async tx => {
    const counts: Record<string, number> = {}
    for (const table of Object.keys(columns) as Table[]) {
      if (!Array.isArray(snapshot.tables?.[table])) throw new Error(`Missing ${table} export`)
      if ((await tx.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error(`Target ${table} must be empty; existing data will not be overwritten`)
    }
    for (const table of Object.keys(columns) as Table[]) {
      for (const row of snapshot.tables[table]) {
        const values = columns[table].map(column => {
          const value = row[column]
          if (value === undefined) throw new Error(`Missing ${table}.${column}`)
          return dates.has(column) ? new Date(value as string) : value
        })
        await tx.query(`INSERT INTO ${table} (${columns[table].join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})`, values)
      }
      const stored = (await tx.query(`SELECT * FROM ${table}`)).rows
      if (digest(table, stored) !== digest(table, snapshot.tables[table])) throw new Error(`Verification mismatch: ${table}; import rolled back`)
      counts[table] = stored.length
    }
    return counts
  })
}
