import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import { paliroResolveLanguage, paliroLaunchArtworkForLanguage } from '../src/services/paliroLanguage.js'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const script = read('../public/paliro-launch.js')
function artwork(languages, nativeLanguage, savedLanguage) {
  const properties = {}, preloads = [], saved = new Map()
  const window = { __paliroLaunchLanguage: nativeLanguage, localStorage: {
    getItem: () => JSON.stringify(savedLanguage), setItem: (key, value) => saved.set(key, value),
  } }
  const document = { documentElement: { style: { setProperty: (key, value) => { properties[key] = value } } },
    createElement: () => ({}), head: { appendChild: link => preloads.push(link) } }
  runInNewContext(script, { window, document, navigator: { languages, language: languages[0] } })
  return { ...window.paliroLaunchArtwork, properties, preloads, saved, document }
}

test('first HTML frame matches the device choice and persists it before Vue mounts', () => {
  for (const deviceLanguage of ['ko', 'ko-KR', 'ko_KR', 'KO-KR', 'zh-CN', 'zh-Hant', 'en-US', 'ja-JP', 'fr', undefined]) {
    const result = artwork([deviceLanguage, 'ko-KR'])
    const language = paliroResolveLanguage({ deviceLanguage })
    assert.equal(result.src, paliroLaunchArtworkForLanguage(language).src)
    assert.equal(result.logoSrc, paliroLaunchArtworkForLanguage(language).logoSrc)
    assert.equal(result.document.documentElement.lang, language)
    assert.equal(JSON.parse(result.saved.get('paliro.appLanguage.v1')), language)
    assert.equal(result.preloads[0].href, result.src)
    assert.equal(result.preloads[1].href, result.logoSrc)
  }
})

test('saved App preference wins over native/browser language, native wins over WebKit defaults', () => {
  assert.equal(artwork(['ko-KR'], 'ko', 'en').document.documentElement.lang, 'en')
  assert.equal(artwork(['en-US'], 'en', 'ko').document.documentElement.lang, 'ko')
  assert.equal(artwork(['en-US'], 'ko').document.documentElement.lang, 'ko')
  assert.equal(artwork(['ko-KR'], 'en').document.documentElement.lang, 'en')
  const native = read('../ios/App/App/PaliroBridgeViewController.swift')
  assert.match(native, /Locale.preferredLanguages/)
  assert.match(native, /let language = primary == "ko" \? "ko" : "en"/)
  assert.match(native, /injectionTime: .atDocumentStart/)
  assert.match(native, /UIImage\(named: "PaliroLaunchSpace"\)/)
  assert.match(native, /UIImage\(named: "PaliroLaunchLogo"\)/)
  assert.doesNotMatch(native, /PaliroLaunchKorean|appaliguaungld|isKoreanLaunch/)
  const entry = read('../src/PaliroEntryApp.vue')
  assert.match(entry, /const launchArtwork = paliroLaunchArtworkForLanguage\(\)/)
  assert.match(entry, /nativeLaunchScreen\?\.setLanguage\(\{ language \}\)/)
  assert.match(entry, /t\(option.labelKey\)/)
})

test('all launch surfaces use the same background and icon without a visible App name', () => {
  const storyboard = read('../ios/App/App/Base.lproj/PaliroLaunchScreen.storyboard')
  assert.ok(storyboard.includes('image="PaliroLaunchSpace"'))
  assert.ok(storyboard.includes('image="PaliroLaunchLogo"'))
  assert.doesNotMatch(storyboard, /PaliroLaunchKorean|appaliguaungld|<label|userDefinedRuntimeAttributes/)
  assert.match(storyboard, /contentMode="scaleAspectFill"/)
  assert.ok(existsSync(new URL('../public/assets/paliro-launch-logo@2x.png', import.meta.url)))
  assert.ok(existsSync(new URL('../public/assets/paliro-launch-logo@3x.png', import.meta.url)))
  assert.doesNotMatch(script, /paliro-launch-screen(?:-ko)?@/)
})
