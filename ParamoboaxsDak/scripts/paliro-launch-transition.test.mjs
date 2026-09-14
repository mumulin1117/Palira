import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const entry = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const nativeBridge = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/PaliroBridgeViewController.swift', import.meta.url), 'utf8')
const appDelegate = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/AppDelegate.swift', import.meta.url), 'utf8')

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
  const plist = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/Info.plist', import.meta.url), 'utf8')
  const project = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox.xcodeproj/project.pbxproj', import.meta.url), 'utf8')
  assert.match(appDelegate, /@main/)
  assert.match(appDelegate, /let window = UIWindow\(frame: UIScreen\.main\.bounds\)/)
  assert.match(appDelegate, /window\.rootViewController = PaliroBridgeViewController\(nibName: nil, bundle: nil\)/)
  assert.match(appDelegate, /self\.window = window\s+window\.makeKeyAndVisible\(\)/)
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
  assert.match(html, /var\(--paliro-launch-image,url\('\/assets\/paliro-welcome-space-background@2x\.png'\)\)/)
})
