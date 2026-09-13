// Run before Vue and styles paint. A fresh install uses the App's Korean default.
(() => {
  let savedLanguage
  try { savedLanguage = JSON.parse(window.localStorage.getItem('paliro.appLanguage.v1')) } catch {}
  const language = ['en', 'ko'].includes(savedLanguage) ? savedLanguage : window.__paliroLaunchLanguage || 'ko'
  const korean = /^ko(?:[-_]|$)/i.test(language)
  const src = korean ? '/assets/paliro-launch-screen-ko@2x.png' : '/assets/paliro-launch-screen@2x.png'
  const srcset = korean ? `${src} 2x, /assets/paliro-launch-screen-ko@3x.png 3x` : ''
  window.paliroLaunchArtwork = { src, srcset }
  document.documentElement.style.setProperty('--paliro-launch-image', korean
    ? `image-set(url("${src}") 2x, url("/assets/paliro-launch-screen-ko@3x.png") 3x)`
    : `url("${src}")`)
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.as = 'image'
  preload.href = src
  if (srcset) preload.imageSrcset = srcset
  document.head.appendChild(preload)
})()
