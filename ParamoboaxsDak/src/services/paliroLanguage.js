export function paliroResolveLanguage({ savedLanguage, nativeLanguage, deviceLanguage } = {}) {
  if (['en', 'ko'].includes(savedLanguage)) return savedLanguage
  if (['en', 'ko'].includes(nativeLanguage)) return nativeLanguage
  return /^ko(?:[-_]|$)/i.test(deviceLanguage ?? '') ? 'ko' : 'en'
}

export function paliroLaunchArtworkForLanguage() {
  return {
    src: '/assets/paliro-welcome-space-background@2x.png',
    srcset: '',
    logoSrc: '/assets/paliro-launch-logo@2x.png',
    logoSrcset: '/assets/paliro-launch-logo@2x.png 2x, /assets/paliro-launch-logo@3x.png 3x',
  }
}
