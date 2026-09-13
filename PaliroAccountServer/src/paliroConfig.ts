export interface PaliroMysqlConfig { host: string; port: number; user: string; password: string; database: string }

export function paliroReadMysqlConfig(env = process.env): PaliroMysqlConfig {
  const database = env.PALIRO_MYSQL_DATABASE ?? 'paliro_account'
  if (!/^paliro_[a-z0-9_]{1,48}$/.test(database)) throw new Error('PALIRO_MYSQL_DATABASE must be a dedicated paliro_ database')
  if (!env.PALIRO_MYSQL_USER || !env.PALIRO_MYSQL_PASSWORD) throw new Error('PALIRO_MYSQL_USER and PALIRO_MYSQL_PASSWORD are required')
  const host = env.PALIRO_MYSQL_HOST ?? '127.0.0.1'
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) throw new Error('Use local MySQL or a loopback SSH tunnel')
  return { host, port: integer(env.PALIRO_MYSQL_PORT, 3306, 1, 65535, 'PALIRO_MYSQL_PORT'),
    user: env.PALIRO_MYSQL_USER, password: env.PALIRO_MYSQL_PASSWORD, database }
}

export interface PaliroConfig {
  host: '127.0.0.1'
  port: number
  mysql: PaliroMysqlConfig
  sessionHours: number
  corsOrigins: string[]
  logLevel: string
  mode: 'development' | 'production'
  trustProxy: false | string[]
}

function integer(value: string | undefined, fallback: number, min: number, max: number, name: string) {
  const result = value === undefined ? fallback : Number(value)
  if (!Number.isInteger(result) || result < min || result > max) throw new Error(`Invalid ${name}`)
  return result
}

export function paliroReadConfig(env = process.env): PaliroConfig {
  const mode = env.NODE_ENV === 'production' ? 'production' : 'development'
  if (env.NODE_ENV && !['development', 'test', 'production'].includes(env.NODE_ENV)) throw new Error('Invalid NODE_ENV')
  if (env.HOST && env.HOST !== '127.0.0.1') throw new Error('Paliro API only binds to 127.0.0.1 behind the local reverse proxy.')
  const port = integer(env.PORT, 3001, 1024, 65535, 'PORT')
  let publicOrigin: string | undefined
  if (env.PALIRO_PUBLIC_ORIGIN) {
    const parsed = new URL(env.PALIRO_PUBLIC_ORIGIN)
    if (parsed.protocol !== 'https:' || parsed.origin !== env.PALIRO_PUBLIC_ORIGIN || parsed.username || parsed.password) {
      throw new Error('PALIRO_PUBLIC_ORIGIN must be an exact HTTPS origin without a path.')
    }
    publicOrigin = parsed.origin
  }
  if (mode === 'production' && !publicOrigin) throw new Error('PALIRO_PUBLIC_ORIGIN is required in production.')
  const developmentOrigins = 'http://localhost:5173,http://127.0.0.1:5173,capacitor://localhost'
  const productionOrigins = `${publicOrigin},capacitor://localhost`
  const corsOrigins = (env.PALIRO_CORS_ORIGINS ?? (mode === 'production' ? productionOrigins : developmentOrigins))
    .split(',').map((origin) => origin.trim()).filter(Boolean)
  if (corsOrigins.some((origin) => !/^(https?:\/\/[^/]+|capacitor:\/\/localhost)$/.test(origin) || origin.includes('*'))) {
    throw new Error('PALIRO_CORS_ORIGINS must contain exact origins, without wildcards or paths.')
  }
  const logLevel = env.LOG_LEVEL ?? 'info'
  if (!['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'].includes(logLevel)) throw new Error('Invalid LOG_LEVEL')
  const localApiOrigins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`]
  return {
    host: '127.0.0.1',
    port,
    mysql: paliroReadMysqlConfig(env),
    sessionHours: integer(env.PALIRO_SESSION_HOURS, 24, 1, 168, 'PALIRO_SESSION_HOURS'),
    corsOrigins: [...new Set(mode === 'production' ? corsOrigins : [...corsOrigins, ...localApiOrigins])],
    logLevel,
    mode,
    // Only the reverse proxy on this host may supply the client address used by rate limiting.
    trustProxy: mode === 'production' ? ['127.0.0.1', '::1'] : false,
  }
}
