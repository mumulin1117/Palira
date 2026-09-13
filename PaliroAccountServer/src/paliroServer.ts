import { paliroReadConfig } from './paliroConfig.js'
import { paliroOpenDatabase } from './paliroDatabase.js'
import { paliroBuildApp } from './paliroApp.js'
import { paliroSeedTestAccount } from './paliroTestAccount.js'

process.umask(0o077)
const config = paliroReadConfig()
let db: Awaited<ReturnType<typeof paliroOpenDatabase>> | undefined
let app: Awaited<ReturnType<typeof paliroBuildApp>> | undefined
let closing = false
async function shutdown() {
  if (closing) return
  closing = true
  try {
    await app?.close()
  } finally {
    await db?.close()
  }
}
try {
  db = await paliroOpenDatabase(config.mysql)
  await paliroSeedTestAccount(db)
  app = await paliroBuildApp({ database: db, sessionHours: config.sessionHours, corsOrigins: config.corsOrigins,
    logLevel: config.logLevel, mode: config.mode, trustProxy: config.trustProxy, protectTestAccount: config.mode === 'production' })
  process.once('SIGINT', () => { void shutdown().catch((error) => { console.error(error.message); process.exitCode = 1 }) })
  process.once('SIGTERM', () => { void shutdown().catch((error) => { console.error(error.message); process.exitCode = 1 }) })
  await app.listen({ host: config.host, port: config.port })
  console.log(`Paliro ${config.mode} API listening on http://${config.host}:${config.port}`)
  console.log('Paliro account API; social data remains in the App until its own migration milestone.')
} catch (error) {
  await shutdown()
  console.error(error instanceof Error ? error.message : 'Paliro server failed to start.')
  process.exitCode = 1
}
