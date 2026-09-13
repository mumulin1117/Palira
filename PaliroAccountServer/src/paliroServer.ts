import { open, unlink, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { paliroReadConfig } from './paliroConfig.js'
import { paliroOpenDatabase } from './paliroDatabase.js'
import { paliroBuildApp } from './paliroApp.js'
import { paliroSeedTestAccount } from './paliroTestAccount.js'

process.umask(0o077)
const config = paliroReadConfig()
const lockPath = `${config.dataDir}.lock`
await mkdir(dirname(config.dataDir), { recursive: true })
// Fail closed on a stale lock instead of allowing two processes to corrupt one PGlite directory.
const lock = await open(lockPath, 'wx', 0o600).catch(() => {
  throw new Error(`Database already in use or lock remains: ${lockPath}. See the startup troubleshooting guide.`)
})
await lock.writeFile(String(process.pid))
let db: Awaited<ReturnType<typeof paliroOpenDatabase>> | undefined
let app: Awaited<ReturnType<typeof paliroBuildApp>> | undefined
let closing = false
async function shutdown() {
  if (closing) return
  closing = true
  try {
    await app?.close()
    await db?.close()
  } finally {
    await lock.close()
    await unlink(lockPath)
  }
}
try {
  db = await paliroOpenDatabase(config.dataDir)
  await paliroSeedTestAccount(db)
  app = await paliroBuildApp({ database: db, sessionHours: config.sessionHours, corsOrigins: config.corsOrigins, logLevel: config.logLevel })
  process.once('SIGINT', () => { void shutdown().catch((error) => { console.error(error.message); process.exitCode = 1 }) })
  process.once('SIGTERM', () => { void shutdown().catch((error) => { console.error(error.message); process.exitCode = 1 }) })
  await app.listen({ host: config.host, port: config.port })
  console.log(`Paliro local API: http://${config.host}:${config.port}/docs/`)
  console.log('Local development only. Paliro account API; social data remains in the App. No cloud database.')
} catch (error) {
  await shutdown()
  console.error(error instanceof Error ? error.message : 'Paliro server failed to start.')
  process.exitCode = 1
}
