import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
    assert.equal(result.srcset, paliroLaunchArtworkForLanguage(language).srcset)
    assert.equal(result.document.documentElement.lang, language)
    assert.equal(JSON.parse(result.saved.get('paliro.appLanguage.v1')), language)
    assert.equal(result.preloads[0].href, result.src)
  }
})

test('saved App preference wins over native/browser language, native wins over WebKit defaults', () => {
  assert.doesNotMatch(artwork(['ko-KR'], 'ko', 'en').src, /-ko@2x/)
  assert.match(artwork(['en-US'], 'en', 'ko').src, /-ko@2x/)
  assert.match(artwork(['en-US'], 'ko').src, /-ko@2x/)
  assert.doesNotMatch(artwork(['ko-KR'], 'en').src, /-ko@2x/)
  const native = read('../ios/App/App/PaliroBridgeViewController.swift')
  assert.match(native, /Locale.preferredLanguages/)
  assert.match(native, /let language = primary == "ko" \? "ko" : "en"/)
  assert.match(native, /injectionTime: .atDocumentStart/)
  assert.match(native, /isKoreanLaunch \? "PaliroLaunchKorean" : "appaliguaungld"/)
  const entry = read('../src/PaliroEntryApp.vue')
  assert.match(entry, /computed\(\(\) => paliroLaunchArtworkForLanguage\(languagePreference.value\)\)/)
  assert.match(entry, /nativeLaunchScreen\?\.setLanguage\(\{ language \}\)/)
  assert.match(entry, /t\(option.labelKey\)/)
})

test('system launch screen is language-neutral while runtime Korean assets stay unchanged', () => {
  const storyboard = read('../ios/App/App/Base.lproj/PaliroLaunchScreen.storyboard')
  assert.ok(storyboard.includes('image="PaliroLaunchSpace"'))
  assert.ok(storyboard.includes('image="PaliroLaunchLogo"'))
  assert.doesNotMatch(storyboard, /PaliroLaunchKorean|appaliguaungld|<label|userDefinedRuntimeAttributes/)
  assert.match(storyboard, /contentMode="scaleAspectFill"/)
  for (const scale of ['2x', '3x']) {
    const name = `paliro-launch-screen-ko@${scale}.png`
    assert.deepEqual(readFileSync(new URL(`../public/assets/${name}`, import.meta.url)), readFileSync(new URL(`../ios/App/App/Assets.xcassets/PaliroLaunchKorean.imageset/${name}`, import.meta.url)))
  }
})
