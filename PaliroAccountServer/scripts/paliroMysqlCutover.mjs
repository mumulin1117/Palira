// One-time deployment on the inspected host; keeps the old release and backup for recovery.
import { readFile, writeFile, mkdir, copyFile, realpath, symlink, rename, chmod } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const root = '/srv/paliro'
const release = await realpath(new URL('..', import.meta.url).pathname)
const oldRelease = await realpath(`${root}/current`)
if (release === oldRelease || !release.startsWith(`${root}/releases/`)) throw new Error('Run from the staged MySQL release')
const backup = `${root}/backups/mysql-cutover-${new Date().toISOString().replace(/[:.]/g, '-')}`
const run = (command, args) => execFileSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
const request = (path, options = {}) => fetch(`http://127.0.0.1:3300${path}`, { ...options, signal: AbortSignal.timeout(15000) })
const oldEnv = await readFile(`${root}/shared/paliro.env`, 'utf8')
const mysqlEnv = await readFile(`${root}/shared/paliro-mysql-runtime.env`, 'utf8')
const nextEnv = oldEnv.split('\n').filter(line => !/^PALIRO_(DATA_DIR|MYSQL_.*)=/.test(line)).join('\n') + '\n' + mysqlEnv
await mkdir(backup, { recursive: true, mode: 0o700 })
await chmod(`${root}/backups`, 0o700)
await copyFile(`${root}/shared/paliro.env`, `${backup}/paliro.env`)
await chmod(`${backup}/paliro.env`, 0o600)
await copyFile('/etc/systemd/system/paliro-account.service', `${backup}/paliro-account.service`)
const login = await request('/palirov1/paliro/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'paliro@gmail.com', password: '67896789' }) })
assert.equal(login.status, 200, 'Pre-migration acceptance login must work')
const session = await login.json()
let stopped = false
let promoted = false
let newServiceStarted = false
try {
  run('systemctl', ['stop', 'paliro-account.service'])
  stopped = true
  run('tar', ['-czf', `${backup}/legacy-data.tgz`, '-C', root, 'data'])
  console.log(run('/usr/local/bin/node', [`${release}/scripts/paliroLegacyExport.mjs`, `${oldRelease}/dist/paliroDatabase.js`, `${root}/data/db`, `${backup}/accounts.json`]).trim())
  console.log(run('/usr/local/bin/node', [`--env-file=${root}/shared/paliro-mysql-runtime.env`, `${release}/scripts/paliroMysqlImport.mjs`, `${backup}/accounts.json`]).trim())
  process.loadEnvFile(`${root}/shared/paliro-mysql-runtime.env`)
  const { paliroOpenDatabase } = await import(pathToFileURL(`${release}/dist/paliroDatabase.js`).href)
  const { paliroReadMysqlConfig } = await import(pathToFileURL(`${release}/dist/paliroConfig.js`).href)
  const { paliroBuildApp } = await import(pathToFileURL(`${release}/dist/paliroApp.js`).href)
  const db = await paliroOpenDatabase(paliroReadMysqlConfig())
  const app = await paliroBuildApp({ database: db })
  try {
    const me = await app.inject({ url: '/palirov1/paliro/me/profile', headers: { authorization: `Bearer ${session.accessToken}` } })
    assert.equal(me.statusCode, 200)
    assert.deepEqual(me.json(), session.user)
  } finally { await app.close(); await db.close() }
  console.log('All imported fields verified; pre-migration token and profile verified against MySQL.')
  await writeFile(`${root}/shared/paliro.env.mysql-next`, nextEnv, { flag: 'wx', mode: 0o600 })
  await rename(`${root}/shared/paliro.env.mysql-next`, `${root}/shared/paliro.env`)
  await symlink(release, `${root}/current.mysql-next`)
  await rename(`${root}/current.mysql-next`, `${root}/current`)
  promoted = true
  await copyFile(`${release}/deploy/paliro-account.service`, '/etc/systemd/system/paliro-account.service')
  run('systemctl', ['daemon-reload'])
  run('systemctl', ['start', 'paliro-account.service'])
  newServiceStarted = true
  let healthy = false
  for (let i = 0; i < 20; i++) {
    const response = await request('/health').catch(() => null)
    if (response?.ok) { healthy = true; break }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert.ok(healthy, 'MySQL service health check failed')
  const me = await request('/palirov1/paliro/me/profile', { headers: { authorization: `Bearer ${session.accessToken}` } })
  assert.equal(me.status, 200)
  assert.deepEqual(await me.json(), session.user)
  await request('/palirov1/paliro/auth/logout', { method: 'POST', headers: { authorization: `Bearer ${session.accessToken}` } })
  await rename(`${root}/data`, `${backup}/legacy-data`)
  console.log(`MySQL cutover complete. Old data archived at ${backup}; /srv/paliro/data is no longer used.`)
} catch (error) {
  if (stopped && !newServiceStarted) {
    await copyFile(`${backup}/paliro.env`, `${root}/shared/paliro.env`)
    await copyFile(`${backup}/paliro-account.service`, '/etc/systemd/system/paliro-account.service')
    if (promoted) {
      await symlink(oldRelease, `${root}/current.rollback`)
      await rename(`${root}/current.rollback`, `${root}/current`)
    }
    run('systemctl', ['daemon-reload'])
    run('systemctl', ['start', 'paliro-account.service'])
    console.error('Cutover failed before public MySQL traffic; old service restored.')
  } else if (newServiceStarted) {
    console.error('Post-start verification failed; MySQL retained to preserve any new writes. Inspect service before retrying.')
  }
  console.error(error.code ?? error.message)
  process.exitCode = 1
}
