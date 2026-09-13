import { paliroReadMysqlConfig } from '../src/paliroConfig.js'
import { paliroOpenDatabase } from '../src/paliroDatabase.js'

export function paliroTestConfig() {
  if (process.env.PALIRO_ALLOW_DATABASE_TESTS !== '1') throw new Error('Set PALIRO_ALLOW_DATABASE_TESTS=1 with a dedicated paliro_*_test database')
  const config = paliroReadMysqlConfig(process.env)
  if (!/^paliro_[a-z0-9_]+_test$/.test(config.database)) throw new Error('Tests refuse non-test databases')
  return config
}

export async function paliroOpenTestDatabase() {
  const db = await paliroOpenDatabase(paliroTestConfig(), true)
  await db.query('DELETE FROM paliro_users')
  await db.query('DELETE FROM paliro_retired_seeds')
  return db
}
