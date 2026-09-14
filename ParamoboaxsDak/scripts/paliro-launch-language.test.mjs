import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const script = read('../public/paliro-launch.js')
function artwork(language, nativeLanguage, savedLanguage) {
  const properties = {}, preloads = []
  const window = { __paliroLaunchLanguage: nativeLanguage,
    localStorage: { getItem: () => JSON.stringify(savedLanguage) } }
  const document = { documentElement: { style: { setProperty: (key, value) => { properties[key] = value } } },
    createElement: () => ({}), head: { appendChild: link => preloads.push(link) } }
  runInNewContext(script, { window, document, navigator: { languages: [language], language } })
  return { ...window.paliroLaunchArtwork, properties, preloads }
}

test('fresh launch defaults to Korean independently of the device language', () => {
  for (const language of ['ko-KR', 'zh-CN', 'zh-Hant', 'en-US', undefined]) {
    const result = artwork(language)
    assert.equal(result.src, '/assets/paliro-launch-screen-ko@2x.png')
    assert.match(result.srcset, /ko@3x.png 3x/)
    assert.match(result.properties['--paliro-launch-image'], /image-set/)
    assert.equal(result.preloads[0].imageSrcset, result.srcset)
  }
})

test('saved App language overrides browser and device language', () => {
  assert.doesNotMatch(artwork('ko-KR', 'ko', 'en').src, /-ko@2x/)
  assert.match(artwork('en-US', 'en', 'ko').src, /-ko@2x/)
  assert.match(artwork('en-US', 'ko').src, /-ko@2x/)
  assert.doesNotMatch(artwork('ko-KR', 'en').src, /-ko@2x/)
  const native = read('../ios/App/App/PaliroBridgeViewController.swift')
  assert.match(native, /paliro\.launchLanguage\.v1/)
  assert.match(native, /string\(forKey: storageKey\) == "en" \? "en" : "ko"/)
  assert.match(native, /let methods = \["hide", "setLanguage"\]/)
  assert.match(native, /injectionTime: .atDocumentStart/)
  assert.match(native, /isKoreanLaunch \? "PaliroLaunchKorean" : "appaliguaungld"/)
  const entry = read('../src/PaliroEntryApp.vue')
  assert.match(entry, /const languagePreference = ref\(paliroGetLanguagePreference\(\)\)/)
  assert.match(entry, /nativeLaunchScreen\?\.setLanguage\(\{ language \}\)/)
  assert.match(entry, /languagePreference\.value = paliroGetLanguagePreference\(userID\)\s+syncNativeLaunchLanguage\(languagePreference\.value\)/)
  assert.match(entry, /languagePreference\.value = paliroSetLanguagePreference[^\n]+\s+syncNativeLaunchLanguage\(languagePreference\.value\)/)
})

test('static first frame and native/WebView Korean assets are consistent', () => {
  const storyboard = read('../ios/App/App/Base.lproj/PaliroLaunchScreen.storyboard')
  assert.ok(storyboard.includes('image="PaliroLaunchKorean"'))
  assert.match(storyboard, /contentMode="scaleAspectFill"/)
  for (const scale of ['2x', '3x']) {
    const name = `paliro-launch-screen-ko@${scale}.png`
    assert.deepEqual(readFileSync(new URL(`../public/assets/${name}`, import.meta.url)), readFileSync(new URL(`../ios/App/App/Assets.xcassets/PaliroLaunchKorean.imageset/${name}`, import.meta.url)))
  }
})
