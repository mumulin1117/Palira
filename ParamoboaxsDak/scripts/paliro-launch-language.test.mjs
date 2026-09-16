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

test('first HTML frame shares English artwork while preserving the device language', () => {
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
  assert.equal(artwork(['en-US'], 'en', 'ko').document.documentElement.lang, 'ko')
  assert.doesNotMatch(artwork(['en-US'], 'en', 'ko').src, /-ko@2x/)
  assert.equal(artwork(['en-US'], 'ko').document.documentElement.lang, 'ko')
  assert.doesNotMatch(artwork(['en-US'], 'ko').src, /-ko@2x/)
  assert.doesNotMatch(artwork(['ko-KR'], 'en').src, /-ko@2x/)
  const native = read('../../PaDlroliroBox/PaDlroliroBox/PaliroCelestialCanvas.swift') + read('../../PaDlroliroBox/PaDlroliroBox/PaliroDawnWhisper.swift')
  assert.match(native, /Locale.preferredLanguages/)
  assert.match(native, /let velvetInspirationTrail = velvetDreamTrail == "ko" \? "ko" : "en"/)
  assert.match(native, /injectionTime: .atDocumentStart/)
  assert.match(native, /let stellarExpressionTrail = "appaliguaungld"/)
  const entry = read('../src/PaliroEntryApp.vue')
  assert.match(entry, /computed\(\(\) => paliroLaunchArtworkForLanguage\(languagePreference.value\)\)/)
  assert.match(entry, /nativeLaunchScreen\?\.setLanguage\(\{ language \}\)/)
  // Language version 1 uses fixed native option labels; launch-language precedence is unchanged.
})

test('system launch, native overlay and WebView use the same English branding', () => {
  const storyboard = read('../../PaDlroliroBox/PaDlroliroBox/Base.lproj/PaliroLaunchScreen.storyboard')
  assert.ok(storyboard.includes('image="appaliguaungld"'))
  assert.doesNotMatch(storyboard, /PaliroLaunchKorean|PaliroLaunchLogo|<label|userDefinedRuntimeAttributes/)
  assert.match(storyboard, /contentMode="scaleAspectFill"/)
  assert.deepEqual(readFileSync(new URL('../public/assets/paliro-launch-screen@2x.png', import.meta.url)), readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/Assets.xcassets/appaliguaungld.imageset/appaliguaungld@2x.png', import.meta.url)))
  for (const language of ['en', 'ko']) {
    const result = artwork([language], language, language)
    assert.match(result.document.title, /^Paliro:/)
    assert.equal(result.properties['--paliro-launch-image'], 'url("/assets/paliro-launch-screen@2x.png")')
  }
  assert.doesNotMatch(read('../src/services/paliroI18n.js'), /팔리로/)
})
