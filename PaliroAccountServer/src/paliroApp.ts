import Fastify, { type FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import type { PaliroDatabase } from './paliroDatabase.js'
import { PaliroAccounts, PALIRO_TERMS_VERSION, type PaliroRegistration, type PaliroProfilePatch } from './paliroAccounts.js'
import { PaliroApiError } from './paliroErrors.js'
import { paliroBearerToken } from './paliroSecurity.js'
import { paliroAuthSchema, paliroEmailSchema, paliroErrorResponses, paliroErrorSchema, paliroLoginPasswordSchema, paliroProfileProperties, paliroRegistrationSchema, paliroUserSchema } from './paliroSchemas.js'
import { paliroFromWireProfile, paliroFromWireRegistration, paliroToWireUser, paliroWireAuthSchema, paliroWireProfileProperties, paliroWireRegistrationSchema, paliroWireUserSchema, type PaliroWireRegistration } from './paliroWireContract.js'

interface PaliroAppOptions {
  database: PaliroDatabase
  sessionHours?: number
  now?: () => Date
  corsOrigins?: string[]
  logLevel?: string
  authLimit?: number
  mode?: 'development' | 'production'
  trustProxy?: false | string[]
  protectTestAccount?: boolean
}

export async function paliroBuildApp(options: PaliroAppOptions) {
  const app = Fastify({
    logger: options.logLevel ? { level: options.logLevel,
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      serializers: { req: (req) => ({ method: req.method, url: String(req.url).split('?')[0] }) },
    } : false,
    trustProxy: options.trustProxy ?? false, bodyLimit: 16 * 1024, requestTimeout: 15000,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false, useDefaults: false } },
  })
  const accounts = new PaliroAccounts(options.database, options.sessionHours ?? 24, options.now, options.protectTestAccount)
  const allowedOrigins = options.corsOrigins ?? ['http://localhost:5173', 'http://127.0.0.1:5173', 'capacitor://localhost', 'http://127.0.0.1:3001', 'http://localhost:3001']
  const errorPayload = (request: FastifyRequest, code: string, message: string) => ({ error: { code, message, requestId: request.id } })

  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, request, reply) => {
    if (error instanceof PaliroApiError) return reply.code(error.statusCode).send(errorPayload(request, error.code, error.message))
    if (error.validation || error.statusCode === 400) return reply.code(400).send(errorPayload(request, 'VALIDATION_ERROR', 'Check the request fields and JSON format.'))
    if (error.statusCode === 429) return reply.code(429).send(errorPayload(request, 'RATE_LIMITED', 'Too many requests. Please try again later.'))
    if (error.statusCode === 413) return reply.code(413).send(errorPayload(request, 'PAYLOAD_TOO_LARGE', 'Request body must be no larger than 16 KiB.'))
    if (error.statusCode === 415) return reply.code(415).send(errorPayload(request, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.'))
    request.log.error({ code: 'INTERNAL_ERROR', requestId: request.id }, 'Request failed; private data omitted.')
    return reply.code(500).send(errorPayload(request, 'INTERNAL_ERROR', 'Something went wrong. Please retry.'))
  })
  app.setNotFoundHandler((request, reply) => reply.code(404).send(errorPayload(request, 'NOT_FOUND', 'Endpoint not found.')))
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store')
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('Referrer-Policy', 'no-referrer')
    reply.header('X-Frame-Options', 'DENY')
    if (request.headers.origin && !allowedOrigins.includes(request.headers.origin)) {
      throw new PaliroApiError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.')
    }
  })
  await app.register(cors, { origin: allowedOrigins, credentials: false, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] })
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' })
  await app.register(swagger, { openapi: {
    info: { title: 'Paliro Member Account API', version: '0.3.0', description: `Current App contract: /palirov1/paliro with palirov profile fields. /v1 is retained for older clients. Terms fixture: ${PALIRO_TERMS_VERSION}. Tokens expire; log in again to renew.` },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    tags: [{ name: 'System' }, { name: 'Paliro Account' }, { name: 'Legacy Account', description: 'Compatibility only; new clients use /palirov1/paliro.' }],
  } })
  app.addSchema(paliroUserSchema)
  app.addSchema(paliroWireUserSchema)
  app.addSchema(paliroErrorSchema)
  await app.register(swaggerUI, { routePrefix: '/docs', staticCSP: true,
    uiConfig: { persistAuthorization: false, docExpansion: 'list', supportedSubmitMethods: ['get', 'post', 'patch', 'delete'] },
  })

  app.get('/', { schema: { hide: true } }, async (_request, reply) => reply.redirect('/docs/'))
  app.get('/health', { schema: { tags: ['System'], summary: 'Check API and database', response: {
    200: { type: 'object', properties: { status: { type: 'string' }, service: { type: 'string' }, mode: { type: 'string' } } }, ...paliroErrorResponses,
  } } }, async () => {
    await options.database.query('SELECT 1')
    return { status: 'ok', service: 'paliro-account-server', mode: options.mode ?? 'development' }
  })
  app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())

  // Share each operation's limiter across new and legacy URLs.
  const authConfig = { rateLimit: false as const }
  const authGuard = app.rateLimit({ max: options.authLimit ?? 10, timeWindow: '1 minute',
    keyGenerator: request => `${request.ip}:${request.method === 'DELETE' ? 'delete' : request.routeOptions.url?.split('/').at(-1)}`,
  })
  const normalizeEmail = async (request: FastifyRequest) => {
    const body = request.body as { email?: unknown } | null
    if (body && typeof body.email === 'string') body.email = body.email.trim().toLowerCase()
  }
  for (const branded of [true, false]) {
    const base = branded ? '/palirov1/paliro' : '/v1'
    const profilePath = branded ? `${base}/me/profile` : `${base}/me`
    const accountPath = branded ? `${base}/me/account` : `${base}/me`
    const accountSchema = { tags: [branded ? 'Paliro Account' : 'Legacy Account'], deprecated: !branded }
    const authSchema = branded ? paliroWireAuthSchema : paliroAuthSchema
    const userSchema = { $ref: branded ? 'PaliroWireUser#' : 'PaliroUser#' }
    const encodeUser = (user: Awaited<ReturnType<typeof accounts.me>>) => branded ? paliroToWireUser(user) : user
    const encodeAuth = (response: Awaited<ReturnType<typeof accounts.login>>) => ({ ...response, user: encodeUser(response.user) })
    app.post<{ Body: PaliroRegistration | PaliroWireRegistration }>(`${base}/auth/register`, {
      config: authConfig, onRequest: authGuard, preValidation: normalizeEmail,
      schema: { ...accountSchema, summary: 'Register a new account and receive a session', body: branded ? paliroWireRegistrationSchema : paliroRegistrationSchema, response: { 201: authSchema, ...paliroErrorResponses } },
    }, async (request, reply) => reply.code(201).send(encodeAuth(await accounts.register(branded ? paliroFromWireRegistration(request.body as PaliroWireRegistration) : request.body as PaliroRegistration))))
    app.post<{ Body: { email: string; password: string } }>(`${base}/auth/login`, {
      config: authConfig, onRequest: authGuard, preValidation: normalizeEmail,
      schema: { ...accountSchema, summary: 'Log in; unknown emails are not silently registered',
        body: { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: paliroEmailSchema, password: paliroLoginPasswordSchema } },
        response: { 200: authSchema, ...paliroErrorResponses } },
    }, async (request) => encodeAuth(await accounts.login(request.body.email, request.body.password)))

    const protectedSchema = { ...accountSchema, security: [{ bearerAuth: [] }] }
    app.get(profilePath, { schema: { ...protectedSchema, summary: 'Read only your own account and profile', response: { 200: userSchema, ...paliroErrorResponses } } },
      async (request) => encodeUser(await accounts.me(paliroBearerToken(request.headers.authorization))))
    app.patch<{ Body: Record<string, unknown> }>(profilePath, { schema: {
      ...protectedSchema, summary: 'Complete or update your profile',
      description: 'Send changed profile fields directly, without a profile wrapper. Omitted fields remain unchanged. Avatar is a built-in asset key, not an uploaded file.',
      body: { type: 'object', additionalProperties: false, minProperties: 1, properties: branded ? paliroWireProfileProperties : paliroProfileProperties,
        examples: branded ? [{ palirovdisplayName: 'Paliro Demo', palirovaboutMe: 'Coffee and quiet walks.' }] : [{ nickname: 'Paliro Demo', bio: 'Coffee and quiet walks.' }] },
      response: { 200: userSchema, ...paliroErrorResponses },
    } }, async (request) => encodeUser(await accounts.updateProfile(paliroBearerToken(request.headers.authorization), branded ? paliroFromWireProfile(request.body) : request.body as PaliroProfilePatch)))
    app.post(`${base}/auth/logout`, { schema: { ...protectedSchema, summary: 'Revoke this session only; repeat calls are safe', response: { 204: { type: 'null' }, ...paliroErrorResponses } } },
      async (request, reply) => {
        await accounts.logout(paliroBearerToken(request.headers.authorization))
        return reply.code(204).send()
      })
    app.delete<{ Body: { password: string } }>(accountPath, { config: authConfig, onRequest: authGuard, schema: {
      ...protectedSchema, summary: 'Delete this local backend account after password confirmation',
      body: { type: 'object', additionalProperties: false, required: ['password'], properties: { password: paliroLoginPasswordSchema } },
      response: { 204: { type: 'null' }, ...paliroErrorResponses },
    } }, async (request, reply) => {
      await accounts.deleteAccount(paliroBearerToken(request.headers.authorization), request.body.password)
      return reply.code(204).send()
    })
  }
  await app.ready()
  return app
}
