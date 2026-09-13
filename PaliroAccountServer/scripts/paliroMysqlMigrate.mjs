import { paliroReadMysqlConfig } from '../dist/paliroConfig.js'
import { paliroOpenDatabase } from '../dist/paliroDatabase.js'

const db = await paliroOpenDatabase(paliroReadMysqlConfig(), true)
await db.close()
console.log('Paliro MySQL schema is ready.')
