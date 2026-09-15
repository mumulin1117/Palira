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
  document.title = language === 'ko' ? 'Paliro: 미스터리 박스' : 'Paliro: Mystery Box, Meet People'
  const src = '/assets/paliro-launch-screen@2x.png'
  const srcset = ''
  window.paliroLaunchArtwork = { src, srcset }
  document.documentElement.style.setProperty('--paliro-launch-image', `url("${src}")`)
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.as = 'image'
  preload.href = src
  if (srcset) preload.imageSrcset = srcset
  document.head.appendChild(preload)
})()
