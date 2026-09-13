// Prepare isolated development/test databases through the administrator's SSH tunnel.
import mysql from 'mysql2/promise'
import { randomBytes } from 'node:crypto'
import { access, writeFile } from 'node:fs/promises'
import { paliroOpenDatabase } from '../dist/paliroDatabase.js'

const user = 'paliro_dev'
const database = 'paliro_account_dev'
const testDatabase = 'paliro_account_mysql_test'
for (const file of ['.env', '.env.test']) {
  try { await access(file); throw new Error(`${file} already exists; inspect before provisioning`) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
}
if (!process.env.PALIRO_PROVISION_ADMIN_PASSWORD) throw new Error('Administrator password is required for provisioning only')
const config = { host: '127.0.0.1', port: 16033, user, password: randomBytes(32).toString('hex'), database }
const admin = await mysql.createConnection({ host: config.host, port: config.port, user: process.env.PALIRO_PROVISION_ADMIN_USER, password: process.env.PALIRO_PROVISION_ADMIN_PASSWORD })
try {
  const [existing] = await admin.query('SELECT User FROM mysql.user WHERE User = ?', [user])
  if (existing.length) throw new Error('Development identity already exists')
  await admin.query('CREATE DATABASE paliro_account_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_bin')
  await admin.query('CREATE DATABASE IF NOT EXISTS paliro_account_mysql_test CHARACTER SET utf8mb4 COLLATE utf8mb4_bin')
  const env = `PALIRO_MYSQL_HOST=${config.host}\nPALIRO_MYSQL_PORT=${config.port}\nPALIRO_MYSQL_DATABASE=${database}\nPALIRO_MYSQL_USER=${user}\nPALIRO_MYSQL_PASSWORD=${config.password}\n`
  await writeFile('.env', env, { flag: 'wx', mode: 0o600 })
  await writeFile('.env.test', env.replace(database, testDatabase) + 'PALIRO_ALLOW_DATABASE_TESTS=1\n', { flag: 'wx', mode: 0o600 })
  await admin.query('CREATE USER ?@? IDENTIFIED BY ?', [user, '127.0.0.1', config.password])
  const [version] = await admin.query('SELECT VERSION() AS version')
  if (!version[0].version.startsWith('5.7.')) throw new Error('This provisioning helper targets the inspected MySQL 5.7 host')
  for (const name of [database, testDatabase]) {
    await admin.query(`INSERT INTO mysql.db (Host, Db, User, Select_priv, Insert_priv, Update_priv, Delete_priv, Create_priv, Alter_priv, Index_priv, References_priv)
      VALUES ('127.0.0.1', ?, ?, 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y')`, [name.replaceAll('_', '\\_'), user])
  }
  await admin.query('FLUSH PRIVILEGES')
  const db = await paliroOpenDatabase(config, true)
  await db.close()
  console.log('Created isolated development/test identity and private local environment files.')
} catch (error) { console.error(error.code ?? error.message); process.exitCode = 1 }
finally { await admin.end() }
