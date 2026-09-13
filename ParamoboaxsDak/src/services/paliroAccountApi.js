const PALIRO_PRODUCTION_AUTH_API_URL = 'https://mobile.paliroweb.site'
const PALIRO_DEVELOPMENT_AUTH_API_URL = 'http://127.0.0.1:3001'
const paliroConfiguredAuthApiURL = import.meta.env?.VITE_PALIRO_AUTH_API_URL?.trim()

export const PALIRO_AUTH_API_URL = paliroConfiguredAuthApiURL
  || (import.meta.env?.DEV === true ? PALIRO_DEVELOPMENT_AUTH_API_URL : PALIRO_PRODUCTION_AUTH_API_URL)
export const PALIRO_AUTH_TERMS_VERSION = '2026-09-local-v1'
export const PALIRO_ACCOUNT_PREFIX = '/palirov1/paliro'

const paliroProfileNames = {
  nickname: 'palirovdisplayName', avatar: 'palirovavatarKey', birthday: 'palirovbirthDate',
  bio: 'palirovaboutMe', interests: 'palirovinterestTags', mood: 'palirovcurrentMood',
  language: 'palirovpreferredLanguage', gender: 'gender',
}
export function paliroProfileToWire(profile) {
  return Object.fromEntries(Object.entries(paliroProfileNames)
    .filter(([local]) => profile[local] !== undefined).map(([local, wire]) => [wire, profile[local]]))
}
function paliroUserFromWire(value) {
  const profile = value?.palirovmemberProfile
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new PaliroAuthError('INVALID_RESPONSE')
  const { palirovmemberProfile, ...user } = value
  return { ...user, profile: Object.fromEntries(Object.entries(paliroProfileNames)
    .filter(([, wire]) => Object.hasOwn(profile, wire)).map(([local, wire]) => [local, profile[wire]])) }
}
const paliroAuthFromWire = value => ({ ...value, user: paliroUserFromWire(value?.user) })

export class PaliroAuthError extends Error {
  constructor(code, status = 0) { super(code); this.code = code; this.status = status }
}

export function createPaliroAccountApi({ baseURL = PALIRO_AUTH_API_URL, fetchImpl = globalThis.fetch, timeoutMs = 12000 } = {}) {
  const base = new URL(baseURL)
  const isLoopback = ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)
  if (import.meta.env?.PROD === true && isLoopback) {
    throw new Error('Production builds cannot use the local account API.')
  }
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && isLoopback)) {
    throw new Error('Account API requires HTTPS outside local development.')
  }
  async function request(path, { method = 'GET', body, token, signal, expectedStatus } = {}) {
    const controller = new AbortController()
    const abort = () => controller.abort()
    if (signal?.aborted) throw new PaliroAuthError('CANCELLED')
    signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(abort, timeoutMs)
    try {
      const response = await fetchImpl(`${baseURL.replace(/\/$/, '')}${path}`, {
        method, signal: controller.signal, cache: 'no-store', credentials: 'omit',
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      if (expectedStatus && response.ok && response.status !== expectedStatus) throw new PaliroAuthError('INVALID_RESPONSE')
      if (response.status === 204) return null
      const payload = await response.json().catch(() => { throw new PaliroAuthError('INVALID_RESPONSE') })
      if (!response.ok) throw new PaliroAuthError(payload.error?.code || 'SERVER_ERROR', response.status)
      return payload
    } catch (error) {
      if (signal?.aborted) throw new PaliroAuthError('CANCELLED')
      if (error instanceof PaliroAuthError) throw error
      throw new PaliroAuthError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR')
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort) }
  }
  return {
    login: (email, password, signal) => request(`${PALIRO_ACCOUNT_PREFIX}/auth/login`, { method: 'POST', body: { email: email.trim(), password }, signal }).then(paliroAuthFromWire),
    register: (draft, profile, language, acceptedTerms, signal) => request(`${PALIRO_ACCOUNT_PREFIX}/auth/register`, { method: 'POST', signal,
      body: { email: draft.email.trim(), password: draft.password, acceptedTerms, termsVersion: PALIRO_AUTH_TERMS_VERSION,
        palirovmemberProfile: paliroProfileToWire({ ...profile, interests: [...profile.interests], language }) } }).then(paliroAuthFromWire),
    me: (token, signal) => request(`${PALIRO_ACCOUNT_PREFIX}/me/profile`, { token, signal }).then(paliroUserFromWire),
    updateProfile: (token, profile, signal) => request(`${PALIRO_ACCOUNT_PREFIX}/me/profile`, { method: 'PATCH', body: paliroProfileToWire(profile), token, signal }).then(paliroUserFromWire),
    logout: (token) => request(`${PALIRO_ACCOUNT_PREFIX}/auth/logout`, { method: 'POST', token }),
    deleteAccount: async (token, password, signal) => {
      const result = await request(`${PALIRO_ACCOUNT_PREFIX}/me/account`, { method: 'DELETE', body: { password }, token, signal, expectedStatus: 204 })
      if (result !== null) throw new PaliroAuthError('INVALID_RESPONSE')
    },
  }
}

export function createPaliroCredentialStore({ nativeStore, storage = globalThis.sessionStorage, installationStorage = globalThis.localStorage } = {}) {
  const key = 'paliro.serverCredential.v1'
  return {
    async read() {
      // Existing installs have a local session from the pre-marker release; a reinstall does not.
      const preserveExistingInstallation = Boolean(installationStorage?.getItem?.('paliro.session'))
      const value = nativeStore ? (await nativeStore.read({ preserveExistingInstallation })).value : storage.getItem(key)
      if (!value) return null
      try { return JSON.parse(value) } catch { return null }
    },
    async write(value) {
      if (nativeStore) await nativeStore.write({ value: JSON.stringify(value) })
      else storage.setItem(key, JSON.stringify(value))
    },
    async clear() {
      if (nativeStore) await nativeStore.remove()
      else storage.removeItem(key)
    },
  }
}

export function paliroAuthErrorKey(error) {
  return ({ INVALID_CREDENTIALS: 'authInvalidCredentials', UNAUTHORIZED: 'authSessionExpired', EMAIL_IN_USE: 'authExistingAccount',
    AGE_RESTRICTED: 'authAdultOnly', INVALID_BIRTHDAY: 'birthdayInvalid', RATE_LIMITED: 'authRateLimited', AUTH_BUSY: 'authRateLimited',
    NETWORK_ERROR: 'authServerUnavailable', TIMEOUT: 'authRequestTimeout', TERMS_REQUIRED: 'authTermsRequired',
    PROFILE_INCOMPLETE: 'profileRequired', VALIDATION_ERROR: 'authInvalidFields', STORAGE_ERROR: 'authStorageError' })[error?.code] || 'authRequestFailed'
}
