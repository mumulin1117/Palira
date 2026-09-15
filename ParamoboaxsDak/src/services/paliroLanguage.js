export function paliroResolveLanguage({ savedLanguage, nativeLanguage, deviceLanguage } = {}) {
  if (['en', 'ko'].includes(savedLanguage)) return savedLanguage
  if (['en', 'ko'].includes(nativeLanguage)) return nativeLanguage
  return /^ko(?:[-_]|$)/i.test(deviceLanguage ?? '') ? 'ko' : 'en'
}

// Branding is shared across locales; UI language resolution remains independent.
export function paliroLaunchArtworkForLanguage() {
  return { src: '/assets/paliro-launch-screen@2x.png', srcset: '' }
}
