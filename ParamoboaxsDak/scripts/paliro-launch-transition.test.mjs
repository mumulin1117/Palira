import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const entry = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const nativeBridge = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/PaliroCelestialCanvas.swift', import.meta.url), 'utf8')
const appDelegate = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/AppDelegate.swift', import.meta.url), 'utf8')

test('native launch art is installed before loading an opaque branded WebView', () => {
  assert.match(nativeBridge, /stellarInspirationTrail\(\)/)
  assert.match(nativeBridge, /lucentCuriosityTrail\(\)\s+velvetImaginationTrail.load\(URLRequest/)
  assert.match(nativeBridge, /velvetImaginationTrail\.isOpaque = true/)
  assert.match(nativeBridge, /velvetImaginationTrail\.backgroundColor = sereneDreamTrail/)
  assert.match(nativeBridge, /velvetImaginationTrail\.underPageBackgroundColor = sereneDreamTrail/)
  assert.match(appDelegate, /astralMood\.backgroundColor = UIColor\(red: 0\.02, green: 0\.04, blue: 0\.13, alpha: 1\)/)
  assert.match(nativeBridge, /sereneWonderTrail.crystalReflectionCanvas\(PaliroAuroraBloom\(\)\)/)
  assert.match(nativeBridge, /UIView\.animate\(withDuration: 0\.28/)
  assert.match(entry, /paliroNativeService\('PaliroLaunchScreen'\)/)
  assert.match(entry, /window\.requestAnimationFrame\(\(\) => \{\s*window\.requestAnimationFrame/)
  assert.match(entry, /void revealWebContent\(\)/)
})

test('the main interface starts in code without a storyboard dependency', () => {
  const plist = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/Info.plist', import.meta.url), 'utf8')
  const project = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox.xcodeproj/project.pbxproj', import.meta.url), 'utf8')
  assert.match(appDelegate, /@main/)
  assert.match(appDelegate, /let astralMood = UIWindow\(frame: UIScreen\.main\.bounds\)/)
  assert.match(appDelegate, /astralMood\.rootViewController = PaliroCelestialCanvas\(nibName: nil, bundle: nil\)/)
  assert.match(appDelegate, /self\.window = astralMood\s+astralMood\.makeKeyAndVisible\(\)/)
  assert.doesNotMatch(plist, /UIMainStoryboardFile|UISceneStoryboardFile/)
  assert.doesNotMatch(project, /Main\.storyboard/)
  assert.equal(existsSync(new URL('../../PaDlroliroBox/PaDlroliroBox/Base.lproj/Main.storyboard', import.meta.url)), false)
  assert.match(plist, /<key>UILaunchStoryboardName<\/key>\s*<string>PaliroLaunchScreen<\/string>/)
})

test('the boot route and earliest HTML paint use the branded dark launch surface', () => {
  assert.match(html, /html,body,#app\{[^}]*background:#050a21/)
  assert.match(entry, /v-if="route === 'boot'"/)
  assert.match(entry, /:src="launchArtwork.src"/)
  assert.match(entry, /:srcset="launchArtwork.srcset/)
  assert.match(html, /src="\/paliro-launch.js"/)
  assert.match(styles, /\.paliro-boot\s*\{[^}]*background:\s*#050a21/s)
  assert.ok(existsSync(new URL('../public/assets/paliro-launch-screen@2x.png', import.meta.url)))
  const storyboard = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/Base.lproj/PaliroLaunchScreen.storyboard', import.meta.url), 'utf8')
  assert.doesNotMatch(storyboard, /systemColor="systemBackgroundColor"/)
  assert.match(storyboard, /red="0\.02" green="0\.04" blue="0\.13" alpha="1"/)
  assert.match(storyboard, /<view key="view"[\s\S]*<imageView[\s\S]*translatesAutoresizingMaskIntoConstraints="NO"/)
  assert.match(html, /var\(--paliro-launch-image,url\('\/assets\/paliro-launch-screen@2x\.png'\)\)/)
})


test('covered WebView reveals even when animation frames never fire', async () => {
  for (const framesRun of [false, true]) {
    let hides = 0
    const timers = new Map(), frames = []
    const window = { requestAnimationFrame: fn => frames.push(fn) }
    const context = vm.createContext({ window, document: { querySelector: () => null }, nextTick: async () => {},
      setTimeout: (fn, ms) => { timers.set(ms, fn); return ms }, clearTimeout: id => timers.delete(id),
      nativeLaunchScreen: { hide: async () => { hides++ } },
    })
    vm.runInContext(entry.match(/async function revealWebContent\(\) \{[^]*?\n\}/)[0], context)
    await context.revealWebContent()
    assert.equal(window.__paliroWebContentReady, true)
    if (framesRun) { frames.shift()(); frames.shift()() }
    else timers.get(1000)()
    assert.equal(hides, 1)
    assert.equal(timers.size, 0)
    while (frames.length) frames.shift()()
    assert.equal(hides, 1)
  }
})
