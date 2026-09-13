export const PALIRO_AUTH_API_URL = import.meta.env?.VITE_PALIRO_AUTH_API_URL || 'http://127.0.0.1:3001'
export const PALIRO_AUTH_TERMS_VERSION = '2026-09-local-v1'

export class PaliroAuthError extends Error {
  constructor(code, status = 0) { super(code); this.code = code; this.status = status }
}

export function createPaliroAccountApi({ baseURL = PALIRO_AUTH_API_URL, fetchImpl = globalThis.fetch, timeoutMs = 12000 } = {}) {
  const base = new URL(baseURL)
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname))) {
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
    login: (email, password, signal) => request('/v1/auth/login', { method: 'POST', body: { email: email.trim(), password }, signal }),
    register: (draft, profile, language, acceptedTerms, signal) => request('/v1/auth/register', { method: 'POST', signal,
      body: { email: draft.email.trim(), password: draft.password, acceptedTerms, termsVersion: PALIRO_AUTH_TERMS_VERSION,
        profile: { nickname: profile.nickname, avatar: profile.avatar, birthday: profile.birthday, bio: profile.bio,
          interests: [...profile.interests], mood: profile.mood, gender: profile.gender, language } } }),
    me: (token, signal) => request('/v1/me', { token, signal }),
    updateProfile: (token, profile, signal) => request('/v1/me', { method: 'PATCH', body: profile, token, signal }),
    logout: (token) => request('/v1/auth/logout', { method: 'POST', token }),
    deleteAccount: async (token, password, signal) => {
      const result = await request('/v1/me', { method: 'DELETE', body: { password }, token, signal, expectedStatus: 204 })
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
