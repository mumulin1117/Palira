import { readFile } from 'node:fs/promises'
import { paliroReadMysqlConfig } from '../dist/paliroConfig.js'
import { paliroOpenDatabase } from '../dist/paliroDatabase.js'
import { paliroImportAccounts } from '../dist/paliroLegacyImport.js'

if (!process.argv[2]) throw new Error('Usage: node paliroMysqlImport.mjs EXPORT.json')
const snapshot = JSON.parse(await readFile(process.argv[2], 'utf8'))
const db = await paliroOpenDatabase(paliroReadMysqlConfig())
try { console.log('Verified import:', await paliroImportAccounts(db, snapshot)) }
finally { await db.close() }
