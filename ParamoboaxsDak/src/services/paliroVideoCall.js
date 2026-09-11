export const PALIRO_CALL_WAIT_MS = 60_000

export async function paliroRequestCallPermissions({ nativePermissions, mediaDevices = globalThis.navigator?.mediaDevices } = {}) {
  if (nativePermissions) {
    const result = await nativePermissions.request()
    if (!result?.camera || !result?.microphone) throw new Error('call-permission-denied')
    return
  }
  if (!mediaDevices?.getUserMedia) throw new Error('call-device-unavailable')
  const stream = await mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
  // Waiting does not record or transmit media. Release the permission-check stream immediately.
  stream.getTracks().forEach((track) => track.stop())
}

export function createPaliroVideoCall({ requestPermissions, canCall, onState, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let state = 'idle'
  let revision = 0
  let timer = null
  const update = (next, error = '') => { state = next; onState({ state, error }) }
  return {
    async start() {
      if (state !== 'idle') return false
      const current = ++revision
      if (!canCall()) { update('failed', 'callFriendRequired'); return false }
      update('requesting')
      try {
        await requestPermissions()
        if (current !== revision) return false
        if (!canCall()) { update('failed', 'callFriendRequired'); return false }
        update('ringing')
        timer = setTimer(() => {
          if (current === revision && state === 'ringing') update('unanswered')
        }, PALIRO_CALL_WAIT_MS)
        return true
      } catch (error) {
        if (current !== revision) return false
        const denied = /NotAllowed|PermissionDenied|permission-denied/i.test(`${error?.name} ${error?.message}`)
        update('failed', denied ? 'callPermissionDenied' : 'callDeviceUnavailable')
        return false
      }
    },
    end() {
      revision++
      clearTimer(timer)
      timer = null
      update('ended')
    },
  }
}
