import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { PaliroApiError } from './paliroErrors.js'

// OWASP scrypt profile: N=2^15, r=8, p=3 (32 MiB). Keep work bounded per process.
let activeHashes = 0
async function derive(password: string, salt: Buffer): Promise<Buffer> {
  if (activeHashes >= 4) throw new PaliroApiError(503, 'AUTH_BUSY', 'Authentication is busy. Please retry shortly.')
  activeHashes += 1
  try {
    return await new Promise((resolve, reject) => {
      scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
        if (error) reject(error)
        else resolve(key)
      })
    })
  } finally { activeHashes -= 1 }
}

export async function paliroHashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await derive(password, salt)
  return `scrypt$32768$8$3$${salt.toString('hex')}$${key.toString('hex')}`
}

const dummyHash = `scrypt$32768$8$3$${'00'.repeat(16)}$${'00'.repeat(64)}`
export async function paliroVerifyPassword(password: string, encoded = dummyHash) {
  const parts = encoded.split('$')
  if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$32768$8$3'
    || !/^[a-f0-9]{32}$/.test(parts[4]!) || !/^[a-f0-9]{128}$/.test(parts[5]!)) return false
  const key = await derive(password, Buffer.from(parts[4]!, 'hex'))
  return timingSafeEqual(key, Buffer.from(parts[5]!, 'hex'))
}

export function paliroNewToken() { return randomBytes(32).toString('base64url') }
export function paliroTokenHash(token: string) { return createHash('sha256').update(token).digest('hex') }

export function paliroBearerToken(header?: string) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(header ?? '')
  if (!match) throw new PaliroApiError(401, 'UNAUTHORIZED', 'Please log in again.')
  return match[1]!
}
