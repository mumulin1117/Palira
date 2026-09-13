import { PaliroAuthError } from './paliroAccountApi.js'

// Server verification is the gate; local records are a business-data cache, not credentials.
export function createPaliroServerSession({ api, credentials, acceptUser, clearLocalSession }) {
  let currentCredential = null
  const checkCancelled = (signal) => { if (signal?.aborted) throw new PaliroAuthError('CANCELLED') }
  async function accept(response, signal) {
    checkCancelled(signal)
    if (!response?.user?.id || !response.user.profileComplete || !response.user.profile
      || typeof response.accessToken !== 'string' || response.accessToken.length < 32
      || !(Date.parse(response.expiresAt) > Date.now())) throw new PaliroAuthError('INVALID_RESPONSE')
    const credential = { accessToken: response.accessToken, expiresAt: response.expiresAt, userID: response.user.id }
    try {
      await credentials.write(credential)
      checkCancelled(signal)
      const session = acceptUser(response.user)
      currentCredential = credential
      return session
    } catch (error) {
      clearLocalSession()
      await credentials.clear().catch(() => {})
      void api.logout(credential.accessToken).catch(() => {})
      if (error.code === 'CANCELLED') throw error
      throw new PaliroAuthError('STORAGE_ERROR')
    }
  }
  async function restore(signal) {
    clearLocalSession()
    let saved
    try { saved = await credentials.read() } catch { throw new PaliroAuthError('STORAGE_ERROR') }
    checkCancelled(signal)
    if (!saved) return null
    if (!saved.userID || typeof saved.accessToken !== 'string' || !(Date.parse(saved.expiresAt) > Date.now())) {
      await credentials.clear()
      return null
    }
    try {
      const user = await api.me(saved.accessToken, signal)
      checkCancelled(signal)
      if (user.id !== saved.userID) throw new PaliroAuthError('UNAUTHORIZED')
      if (!user.profileComplete) { await credentials.clear(); return null }
      return await accept({ ...saved, user }, signal)
    } catch (error) {
      if (error.status === 401 || error.code === 'UNAUTHORIZED') await credentials.clear()
      throw error
    }
  }
  async function logout() {
    const token = currentCredential?.accessToken
    currentCredential = null
    clearLocalSession()
    if (token) void api.logout(token).catch(() => {})
    try { await credentials.clear() } catch { throw new PaliroAuthError('STORAGE_ERROR') }
  }
  async function profileRequest(patch, signal) {
    const credential = currentCredential
    if (!credential || !(Date.parse(credential.expiresAt) > Date.now())) throw new PaliroAuthError('UNAUTHORIZED', 401)
    checkCancelled(signal)
    const user = patch === undefined
      ? await api.me(credential.accessToken, signal)
      : await api.updateProfile(credential.accessToken, patch, signal)
    checkCancelled(signal)
    if (currentCredential !== credential) throw new PaliroAuthError('CANCELLED')
    if (user?.id !== credential.userID || !user.profileComplete || !user.profile) throw new PaliroAuthError('INVALID_RESPONSE')
    return user
  }
  async function deleteAccount(password, signal) {
    const credential = currentCredential
    if (!credential || !(Date.parse(credential.expiresAt) > Date.now())) throw new PaliroAuthError('UNAUTHORIZED', 401)
    checkCancelled(signal)
    await api.deleteAccount(credential.accessToken, password, signal)
    if (currentCredential !== credential) throw new PaliroAuthError('CANCELLED')
    currentCredential = null
    // A confirmed remote deletion cannot be undone by a local cleanup failure.
    let cleanupFailed = false
    try { clearLocalSession() } catch { cleanupFailed = true }
    try { await credentials.clear() } catch { cleanupFailed = true }
    return { deleted: true, cleanupFailed }
  }
  return { accept, restore, logout, deleteAccount, readProfile: signal => profileRequest(undefined, signal), saveProfile: (patch, signal) => profileRequest(patch, signal) }
}
