export function paliroResolveLanguage({ savedLanguage, nativeLanguage, deviceLanguage } = {}) {
  if (['en', 'ko'].includes(savedLanguage)) return savedLanguage
  if (['en', 'ko'].includes(nativeLanguage)) return nativeLanguage
  return /^ko(?:[-_]|$)/i.test(deviceLanguage ?? '') ? 'ko' : 'en'
}

export function paliroLaunchArtworkForLanguage(language) {
  const src = language === 'ko' ? '/assets/paliro-launch-screen-ko@2x.png' : '/assets/paliro-launch-screen@2x.png'
  return { src, srcset: language === 'ko' ? `${src} 2x, /assets/paliro-launch-screen-ko@3x.png 3x` : '' }
}
