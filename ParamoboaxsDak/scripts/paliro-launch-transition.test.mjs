import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const entry = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const nativeBridge = readFileSync(new URL('../ios/App/App/PaliroBridgeViewController.swift', import.meta.url), 'utf8')

test('native launch art remains above a transparent WebView until the Vue first frame is ready', () => {
  assert.match(nativeBridge, /showLaunchOverlay\(\)/)
  assert.match(nativeBridge, /webView\?\.isOpaque = false/)
  assert.match(nativeBridge, /registerPluginInstance\(PaliroLaunchScreenPlugin\(\)\)/)
  assert.match(nativeBridge, /UIView\.animate\(withDuration: 0\.28/)
  assert.match(entry, /registerPlugin\('PaliroLaunchScreen'\)/)
  assert.match(entry, /window\.requestAnimationFrame\(\(\) => \{\s*window\.requestAnimationFrame/)
  assert.match(entry, /void revealWebContent\(\)/)
})

test('the boot route and earliest HTML paint use the branded dark launch surface', () => {
  assert.match(html, /html,body,#app\{[^}]*background:#050b21/)
  assert.match(entry, /v-if="route === 'boot'"/)
  assert.match(entry, /src="\/assets\/paliro-launch-screen@2x\.png"/)
  assert.match(styles, /\.paliro-boot\s*\{[^}]*background:\s*#050b21/s)
  assert.ok(existsSync(new URL('../public/assets/paliro-launch-screen@2x.png', import.meta.url)))
})
