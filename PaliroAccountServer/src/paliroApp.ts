import Fastify, { type FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import type { PGlite } from '@electric-sql/pglite'
import { PaliroAccounts, PALIRO_TERMS_VERSION, type PaliroRegistration, type PaliroProfilePatch } from './paliroAccounts.js'
import { PaliroApiError } from './paliroErrors.js'
import { paliroBearerToken } from './paliroSecurity.js'
import { paliroAuthSchema, paliroEmailSchema, paliroErrorResponses, paliroErrorSchema, paliroLoginPasswordSchema, paliroProfileProperties, paliroRegistrationSchema, paliroUserSchema } from './paliroSchemas.js'

interface PaliroAppOptions {
  database: PGlite
  sessionHours?: number
  now?: () => Date
  corsOrigins?: string[]
  logLevel?: string
  authLimit?: number
}

export async function paliroBuildApp(options: PaliroAppOptions) {
  const app = Fastify({
    logger: options.logLevel ? { level: options.logLevel,
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      serializers: { req: (req) => ({ method: req.method, url: String(req.url).split('?')[0] }) },
    } : false,
    trustProxy: false, bodyLimit: 16 * 1024, requestTimeout: 15000,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false, useDefaults: false } },
  })
  const accounts = new PaliroAccounts(options.database, options.sessionHours ?? 24, options.now)
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
    info: { title: 'Paliro Local Account API', version: '0.1.0', description: `Local development only. No email verification or cloud services. Terms fixture: ${PALIRO_TERMS_VERSION}. Tokens expire; log in again to renew. Do not use real personal data.` },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    tags: [{ name: 'System' }, { name: 'Account' }],
  } })
  app.addSchema(paliroUserSchema)
  app.addSchema(paliroErrorSchema)
  await app.register(swaggerUI, { routePrefix: '/docs', staticCSP: true,
    uiConfig: { persistAuthorization: false, docExpansion: 'list', supportedSubmitMethods: ['get', 'post', 'patch', 'delete'] },
  })

  app.get('/', { schema: { hide: true } }, async (_request, reply) => reply.redirect('/docs/'))
  app.get('/health', { schema: { tags: ['System'], summary: 'Check API and database', response: {
    200: { type: 'object', properties: { status: { type: 'string' }, service: { type: 'string' }, mode: { type: 'string' } } }, ...paliroErrorResponses,
  } } }, async () => {
    await options.database.query('SELECT 1')
    return { status: 'ok', service: 'paliro-account-server', mode: 'local-only' }
  })
  app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())

  const authConfig = { rateLimit: { max: options.authLimit ?? 10, timeWindow: '1 minute' } }
  const normalizeEmail = async (request: FastifyRequest) => {
    const body = request.body as { email?: unknown } | null
    if (body && typeof body.email === 'string') body.email = body.email.trim().toLowerCase()
  }
  app.post<{ Body: PaliroRegistration }>('/v1/auth/register', {
    config: authConfig, preValidation: normalizeEmail,
    schema: { tags: ['Account'], summary: 'Register a new account and receive a session', body: paliroRegistrationSchema, response: { 201: paliroAuthSchema, ...paliroErrorResponses } },
  }, async (request, reply) => reply.code(201).send(await accounts.register(request.body)))
  app.post<{ Body: { email: string; password: string } }>('/v1/auth/login', {
    config: authConfig, preValidation: normalizeEmail,
    schema: { tags: ['Account'], summary: 'Log in; unknown emails are not silently registered',
      body: { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: paliroEmailSchema, password: paliroLoginPasswordSchema } },
      response: { 200: paliroAuthSchema, ...paliroErrorResponses } },
  }, async (request) => accounts.login(request.body.email, request.body.password))

  const protectedSchema = { tags: ['Account'], security: [{ bearerAuth: [] }] }
  app.get('/v1/me', { schema: { ...protectedSchema, summary: 'Read only your own account and profile', response: { 200: { $ref: 'PaliroUser#' }, ...paliroErrorResponses } } },
    async (request) => accounts.me(paliroBearerToken(request.headers.authorization)))
  app.patch<{ Body: PaliroProfilePatch }>('/v1/me', { schema: {
    ...protectedSchema, summary: 'Complete or update your profile',
    description: 'First update requires nickname and an adult birthday. Omitted fields remain unchanged. Avatar is an existing asset key, not an uploaded file.',
    body: { type: 'object', additionalProperties: false, minProperties: 1, properties: paliroProfileProperties,
      examples: [{ nickname: 'Paliro Demo', avatar: 'violet', birthday: '1998-10-24', bio: 'Coffee and quiet walks.', interests: ['Coffee', 'Nature'], language: 'en' }] },
    response: { 200: { $ref: 'PaliroUser#' }, ...paliroErrorResponses },
  } }, async (request) => accounts.updateProfile(paliroBearerToken(request.headers.authorization), request.body))
  app.post('/v1/auth/logout', { schema: { ...protectedSchema, summary: 'Revoke this session only; repeat calls are safe', response: { 204: { type: 'null' }, ...paliroErrorResponses } } },
    async (request, reply) => {
      await accounts.logout(paliroBearerToken(request.headers.authorization))
      return reply.code(204).send()
    })
  app.delete<{ Body: { password: string } }>('/v1/me', { config: authConfig, schema: {
    ...protectedSchema, summary: 'Delete this local backend account after password confirmation',
    body: { type: 'object', additionalProperties: false, required: ['password'], properties: { password: paliroLoginPasswordSchema } },
    response: { 204: { type: 'null' }, ...paliroErrorResponses },
  } }, async (request, reply) => {
    await accounts.deleteAccount(paliroBearerToken(request.headers.authorization), request.body.password)
    return reply.code(204).send()
  })
  await app.ready()
  return app
}
