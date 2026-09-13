import { PALIRO_TERMS_VERSION, paliroInterests } from './paliroAccounts.js'

export const paliroEmailSchema = { type: 'string', format: 'email', minLength: 3, maxLength: 254 }
export const paliroPasswordSchema = { type: 'string', minLength: 8, maxLength: 128 }
export const paliroLoginPasswordSchema = { type: 'string', minLength: 1, maxLength: 128 }
export const paliroProfileProperties = {
  nickname: { type: 'string', minLength: 1, maxLength: 32 },
  avatar: { type: 'string', enum: ['violet', 'blue', 'coral', 'mint', 'golden'] },
  birthday: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
  bio: { type: 'string', maxLength: 280 },
  interests: { type: 'array', maxItems: 20, uniqueItems: true, items: { type: 'string', enum: paliroInterests } },
  language: { type: 'string', enum: ['en', 'ko'] },
  mood: { type: 'string', enum: ['Want to Chat', 'Feeling Happy', 'A Little Shy', 'Feeling Chill', 'Ready for Fun', 'A Little Lonely'] },
  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
}
export const paliroUserSchema = {
  $id: 'PaliroUser', type: 'object', additionalProperties: false,
  required: ['id', 'email', 'emailVerified', 'isTestAccount', 'profileComplete', 'profile', 'terms', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' }, email: paliroEmailSchema,
    emailVerified: { type: 'boolean' }, profileComplete: { type: 'boolean' },
    isTestAccount: { type: 'boolean' },
    profile: { type: 'object', additionalProperties: false,
      required: Object.keys(paliroProfileProperties),
      properties: { ...paliroProfileProperties, nickname: { type: 'string', maxLength: 32 }, birthday: { type: ['string', 'null'] } } },
    terms: { type: 'object', required: ['version', 'acceptedAt'], additionalProperties: false,
      properties: { version: { type: 'string' }, acceptedAt: { type: 'string', format: 'date-time' } } },
    createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
  },
}
export const paliroAuthSchema = {
  type: 'object', additionalProperties: false, required: ['user', 'accessToken', 'tokenType', 'expiresAt'],
  properties: {
    user: { $ref: 'PaliroUser#' }, accessToken: { type: 'string' }, tokenType: { type: 'string', enum: ['Bearer'] },
    expiresAt: { type: 'string', format: 'date-time' },
  },
}
export const paliroErrorSchema = {
  $id: 'PaliroError', type: 'object', additionalProperties: false, required: ['error'],
  properties: { error: { type: 'object', additionalProperties: false, required: ['code', 'message', 'requestId'],
    properties: { code: { type: 'string' }, message: { type: 'string' }, requestId: { type: 'string' } } } },
}
export const paliroErrorResponses = Object.fromEntries([400, 401, 403, 404, 409, 413, 415, 429, 500, 503].map((code) => [code, { $ref: 'PaliroError#' }]))
export const paliroRegistrationSchema = {
  type: 'object', additionalProperties: false, required: ['email', 'password', 'acceptedTerms', 'termsVersion', 'profile'],
  properties: {
    email: paliroEmailSchema, password: paliroPasswordSchema,
    acceptedTerms: { type: 'boolean', description: 'Must be true; false is rejected.' },
    termsVersion: { type: 'string', maxLength: 64, description: `Current local development version: ${PALIRO_TERMS_VERSION}` },
    profile: { type: 'object', additionalProperties: false, required: Object.keys(paliroProfileProperties), properties: {
      ...paliroProfileProperties, bio: { type: 'string', minLength: 1, maxLength: 150 },
      interests: { ...paliroProfileProperties.interests, minItems: 3 },
    } },
  },
  examples: [{ email: 'demo@example.test', password: 'Example-only-12345', acceptedTerms: true, termsVersion: PALIRO_TERMS_VERSION,
    profile: { nickname: 'Paliro Demo', avatar: 'violet', birthday: '1998-10-24', bio: 'Coffee and quiet walks.', interests: ['Coffee', 'Nature', 'Music'], language: 'en', mood: 'Want to Chat', gender: 'Other' } }],
}
