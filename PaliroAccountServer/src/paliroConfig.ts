import { parse, resolve } from 'node:path'

export interface PaliroConfig {
  host: '127.0.0.1'
  port: number
  dataDir: string
  sessionHours: number
  corsOrigins: string[]
  logLevel: string
}

function integer(value: string | undefined, fallback: number, min: number, max: number, name: string) {
  const result = value === undefined ? fallback : Number(value)
  if (!Number.isInteger(result) || result < min || result > max) throw new Error(`Invalid ${name}`)
  return result
}

export function paliroReadConfig(env = process.env): PaliroConfig {
  if (env.NODE_ENV === 'production') throw new Error('This milestone is local-only. Production deployment is not configured.')
  if (env.HOST && env.HOST !== '127.0.0.1') throw new Error('This local server only binds to 127.0.0.1.')
  const directory = env.PALIRO_DATA_DIR ?? '.paliro-data'
  const dataDir = resolve(directory)
  if (!directory.trim() || dataDir === process.cwd() || dataDir === parse(dataDir).root) {
    throw new Error('PALIRO_DATA_DIR must name a dedicated database directory, not the project or filesystem root.')
  }
  const port = integer(env.PORT, 3001, 1024, 65535, 'PORT')
  const corsOrigins = (env.PALIRO_CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173,capacitor://localhost')
    .split(',').map((origin) => origin.trim()).filter(Boolean)
  if (corsOrigins.some((origin) => !/^(https?:\/\/[^/]+|capacitor:\/\/localhost)$/.test(origin) || origin.includes('*'))) {
    throw new Error('PALIRO_CORS_ORIGINS must contain exact origins, without wildcards or paths.')
  }
  const logLevel = env.LOG_LEVEL ?? 'info'
  if (!['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'].includes(logLevel)) throw new Error('Invalid LOG_LEVEL')
  return {
    host: '127.0.0.1',
    port,
    dataDir,
    sessionHours: integer(env.PALIRO_SESSION_HOURS, 24, 1, 168, 'PALIRO_SESSION_HOURS'),
    corsOrigins: [...new Set([...corsOrigins, `http://127.0.0.1:${port}`, `http://localhost:${port}`])],
    logLevel,
  }
}
