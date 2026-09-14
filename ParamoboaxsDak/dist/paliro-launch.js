// Resolve and persist the installation language before Vue or styles paint.
(() => {
  let savedLanguage
  try { savedLanguage = JSON.parse(window.localStorage.getItem('paliro.appLanguage.v1')) } catch {}
  const nativeLanguage = window.__paliroLaunchLanguage
  const deviceLanguage = navigator.languages?.[0] ?? navigator.language
  const language = ['en', 'ko'].includes(savedLanguage) ? savedLanguage
    : ['en', 'ko'].includes(nativeLanguage) ? nativeLanguage
      : /^ko(?:[-_]|$)/i.test(deviceLanguage ?? '') ? 'ko' : 'en'
  try { window.localStorage.setItem('paliro.appLanguage.v1', JSON.stringify(language)) } catch {}
  document.documentElement.lang = language
  document.title = language === 'ko' ? '팔리로: 미스터리 박스' : 'Paliro: Mystery Box, Meet People'
  const src = '/assets/paliro-welcome-space-background@2x.png'
  const logoSrc = '/assets/paliro-launch-logo@2x.png'
  const logoSrcset = `${logoSrc} 2x, /assets/paliro-launch-logo@3x.png 3x`
  window.paliroLaunchArtwork = { src, srcset: '', logoSrc, logoSrcset }
  document.documentElement.style.setProperty('--paliro-launch-image', `url("${src}")`)
  document.documentElement.style.setProperty('--paliro-launch-logo-image', `url("${logoSrc}")`)
  for (const href of [src, logoSrc]) {
    const preload = document.createElement('link')
    preload.rel = 'preload'
    preload.as = 'image'
    preload.href = href
    document.head.appendChild(preload)
  }
})()
