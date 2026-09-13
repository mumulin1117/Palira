// Host administration only. Never invoked by the API process.
import mysql from 'mysql2/promise'
import { randomBytes } from 'node:crypto'
import { writeFile, access } from 'node:fs/promises'

const destination = '/srv/paliro/shared'
const targets = [
  { user: 'paliro_app', file: 'paliro-mysql-runtime.env', ddl: false },
  { user: 'paliro_migrate', file: 'paliro-mysql-migration.env', ddl: true },
]
const database = 'paliro_account'
const escapedDatabase = database.replaceAll('_', '\\_')
const host = '127.0.0.1'
if (!process.env.PALIRO_PROVISION_ADMIN_PASSWORD) throw new Error('Provide PALIRO_PROVISION_ADMIN_PASSWORD only to the provisioning process')
const admin = await mysql.createConnection({ host, port: 6033, user: process.env.PALIRO_PROVISION_ADMIN_USER ?? 'root', password: process.env.PALIRO_PROVISION_ADMIN_PASSWORD })
try {
  const [existing] = await admin.query('SELECT User, Host FROM mysql.user WHERE User IN (?, ?)', targets.map(target => target.user))
  if (existing.length) throw new Error('Paliro database identities already exist; inspect before reprovisioning')
  for (const target of targets) {
    try { await access(`${destination}/${target.file}`); throw new Error('Credential destination already exists') }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  const [beforeUsers] = await admin.query('SELECT * FROM mysql.user ORDER BY User, Host')
  const [beforeGrants] = await admin.query('SELECT * FROM mysql.db ORDER BY User, Host, Db')
  const [version] = await admin.query('SELECT VERSION() AS version')
  const directGrants = process.argv.includes('--mysql57-grant-table')
  if (directGrants && !version[0].version.startsWith('5.7.')) throw new Error('The grant-table fallback is only for the inspected MySQL 5.7 host')
  await admin.query('CREATE DATABASE IF NOT EXISTS paliro_account CHARACTER SET utf8mb4 COLLATE utf8mb4_bin')
  for (const target of targets) {
    const password = randomBytes(32).toString('hex')
    // Persist first: a failed grant can be repaired without rotating or losing a generated password.
    const env = `PALIRO_MYSQL_HOST=${host}\nPALIRO_MYSQL_PORT=6033\nPALIRO_MYSQL_DATABASE=${database}\nPALIRO_MYSQL_USER=${target.user}\nPALIRO_MYSQL_PASSWORD=${password}\n`
    await writeFile(`${destination}/${target.file}`, env, { flag: 'wx', mode: 0o600 })
    await admin.query('CREATE USER ?@? IDENTIFIED BY ?', [target.user, host, password])
    if (directGrants) {
      // Add only the newly-created identities' database grants. Never elevate the supplied admin.
      await admin.query(`INSERT INTO mysql.db (Host, Db, User, Select_priv, Insert_priv, Update_priv, Delete_priv, Create_priv, Alter_priv, Index_priv, References_priv)
        VALUES (?, ?, ?, 'Y', 'Y', 'Y', 'Y', ?, ?, ?, ?)`, [host, escapedDatabase, target.user, ...Array(4).fill(target.ddl ? 'Y' : 'N')])
    } else {
      const privileges = target.ddl ? 'SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES' : 'SELECT, INSERT, UPDATE, DELETE'
      await admin.query(`GRANT ${privileges} ON \`${escapedDatabase}\`.* TO ?@?`, [target.user, host])
    }
  }
  if (directGrants) await admin.query('FLUSH PRIVILEGES')
  const [afterUsers] = await admin.query('SELECT * FROM mysql.user WHERE User NOT IN (?, ?) ORDER BY User, Host', targets.map(target => target.user))
  const [afterGrants] = await admin.query('SELECT * FROM mysql.db WHERE User NOT IN (?, ?) ORDER BY User, Host, Db', targets.map(target => target.user))
  if (JSON.stringify(beforeUsers) !== JSON.stringify(afterUsers) || JSON.stringify(beforeGrants) !== JSON.stringify(afterGrants)) {
    throw new Error('Existing database privileges changed during provisioning; inspect before continuing')
  }
  console.log('Created dedicated Paliro runtime/migration accounts. Existing MySQL identities and database grants verified unchanged.')
} catch (error) {
  console.error(error.code ?? 'PROVISION_FAILED', error.code ? 'Provisioning failed; inspect only Paliro identities before retrying.' : error.message)
  process.exitCode = 1
} finally { await admin.end() }
