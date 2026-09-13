// One-time tool: uses the retained old release, never a dependency of the MySQL server.
import { access, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const [modulePath, dataDir, destination] = process.argv.slice(2)
if (!modulePath || !dataDir || !destination) throw new Error('Usage: node paliroLegacyExport.mjs OLD_RELEASE/dist/paliroDatabase.js OLD_DATA_DIR OUTPUT.json')
try { await access(`${dataDir}.lock`); throw new Error('Stop the old Paliro service before exporting') }
catch (error) { if (error.code !== 'ENOENT') throw error }
const legacy = await import(pathToFileURL(modulePath).href)
const paliroOpenDatabase = legacy.paliroOpenDatabase ?? (async directory => {
  const instance = new legacy.PGlite(directory)
  await instance.waitReady
  return instance
})
const db = await paliroOpenDatabase(dataDir)
try {
  const tables = {}
  tables.paliro_users = (await db.query('SELECT *, birthday::text AS birthday FROM paliro_users ORDER BY id')).rows
  tables.paliro_sessions = (await db.query('SELECT * FROM paliro_sessions ORDER BY token_hash')).rows
  tables.paliro_retired_seeds = (await db.query('SELECT * FROM paliro_retired_seeds ORDER BY seed_name')).rows
  await writeFile(destination, JSON.stringify({ format: 'paliro-accounts-v1', tables }), { flag: 'wx', mode: 0o600 })
  console.log(JSON.stringify(Object.fromEntries(Object.entries(tables).map(([table, rows]) => [table, rows.length]))))
} finally { await db.close() }
