import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const entry = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const nativeBridge = readFileSync(new URL('../ios/App/App/PaliroBridgeViewController.swift', import.meta.url), 'utf8')
const appDelegate = readFileSync(new URL('../ios/App/App/AppDelegate.swift', import.meta.url), 'utf8')
const firstLaunch = readFileSync(new URL('../src/components/PaliroFirstLaunch.vue', import.meta.url), 'utf8')

test('native launch art is installed before loading an opaque branded WebView', () => {
  assert.match(nativeBridge, /showLaunchOverlay\(\)/)
  assert.match(nativeBridge, /configureLaunchSurface\(\)\s+webView.load\(URLRequest/)
  assert.match(nativeBridge, /webView\.isOpaque = true/)
  assert.match(nativeBridge, /webView\.backgroundColor = launchBackgroundColor/)
  assert.match(nativeBridge, /webView\.underPageBackgroundColor = launchBackgroundColor/)
  assert.match(appDelegate, /window\.backgroundColor = UIColor\(red: 0\.02, green: 0\.04, blue: 0\.13, alpha: 1\)/)
  assert.match(nativeBridge, /bridge.register\(PaliroLaunchScreenPlugin\(\)\)/)
  assert.match(nativeBridge, /UIView\.animate\(withDuration: 0\.28/)
  assert.match(entry, /paliroNativeService\('PaliroLaunchScreen'\)/)
  assert.match(entry, /window\.requestAnimationFrame\(\(\) => \{\s*window\.requestAnimationFrame/)
  assert.match(entry, /void revealWebContent\(\)/)
})

test('the main interface starts in code without a storyboard dependency', () => {
  const plist = readFileSync(new URL('../ios/App/App/Info.plist', import.meta.url), 'utf8')
  const project = readFileSync(new URL('../ios/App/App.xcodeproj/project.pbxproj', import.meta.url), 'utf8')
  assert.match(appDelegate, /@main/)
  assert.match(appDelegate, /let window = UIWindow\(frame: UIScreen\.main\.bounds\)/)
  assert.match(appDelegate, /window\.rootViewController = PaliroBridgeViewController\(nibName: nil, bundle: nil\)/)
  assert.match(appDelegate, /self\.window = window\s+window\.makeKeyAndVisible\(\)/)
  assert.doesNotMatch(plist, /UIMainStoryboardFile|UISceneStoryboardFile/)
  assert.doesNotMatch(project, /Main\.storyboard/)
  assert.equal(existsSync(new URL('../ios/App/App/Base.lproj/Main.storyboard', import.meta.url)), false)
  assert.match(plist, /<key>UILaunchStoryboardName<\/key>\s*<string>PaliroLaunchScreen<\/string>/)
})

test('the boot route and earliest HTML paint use the branded dark launch surface', () => {
  assert.match(html, /html,body,#app\{[^}]*background:#050a21/)
  assert.match(entry, /v-if="route === 'boot'"/)
  assert.match(entry, /class="paliro-boot-background" :src="launchArtwork.src"/)
  assert.match(entry, /class="paliro-boot-logo" :src="launchArtwork.logoSrc"/)
  assert.match(html, /src="\/paliro-launch.js"/)
  assert.match(styles, /\.paliro-boot\s*\{[^}]*background:\s*#050a21/s)
  assert.ok(existsSync(new URL('../public/assets/paliro-welcome-space-background@2x.png', import.meta.url)))
  assert.ok(existsSync(new URL('../public/assets/paliro-launch-logo@2x.png', import.meta.url)))
  const storyboard = readFileSync(new URL('../ios/App/App/Base.lproj/PaliroLaunchScreen.storyboard', import.meta.url), 'utf8')
  assert.doesNotMatch(storyboard, /systemColor="systemBackgroundColor"/)
  assert.match(storyboard, /red="0\.02" green="0\.04" blue="0\.13" alpha="1"/)
  assert.match(storyboard, /<view key="view"[\s\S]*<imageView[\s\S]*translatesAutoresizingMaskIntoConstraints="NO"/)
  assert.match(html, /var\(--paliro-launch-image,url\('\/assets\/paliro-welcome-space-background@2x\.png'\)\)/)
  assert.match(html, /var\(--paliro-launch-logo-image,url\('\/assets\/paliro-launch-logo@2x\.png'\)\)/)
  assert.doesNotMatch(firstLaunch, /<h1>|firstLaunchCopy|paliro-welcome-hero/)
  assert.match(firstLaunch, /paliro-intro-logo/)
})

test('setup birthday field stays within the parent 24 point content insets', () => {
  assert.match(entry, /class="paliro-field paliro-birthday-field"/)
  assert.match(styles, /\.paliro-birthday-field, \.paliro-date-field \{ width: 100%; min-width: 0; max-width: 100%; \}/)
  assert.match(styles, /\.paliro-view\s*\{[^}]*padding: max\(22px, env\(safe-area-inset-top\)\) 24px/s)
})
