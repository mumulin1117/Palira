export const PALIRO_INTRO_DURATION = 3400

export function claimPaliroFirstLaunch(storage) {
  try {
    if (storage.getItem('paliro.firstLaunch.v1')) return false
    // Existing installations already have local onboarding or account records.
    const existing = ['paliro.eulaAccepted', 'paliro.localUsers', 'paliro.session']
      .some(key => storage.getItem(key) !== null)
    storage.setItem('paliro.firstLaunch.v1', 'shown')
    return !existing
  } catch {
    return false
  }
}
