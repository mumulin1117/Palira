import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from './paliro-native-source.mjs'
import { paliroNativeService, paliroNativeFileSource } from '../src/services/paliroNativeBridge.js'

const source = readFileSync(new URL('../public/paliro-native.js', import.meta.url), 'utf8')
function nativePage(timers = { setTimeout, clearTimeout }) {
  const calls = []
  const window = { webkit: { messageHandlers: { paliro: { postMessage: value => calls.push(value) } } } }
  window.top = window
  vm.runInNewContext(source, { ...timers, window, location: { protocol: 'capacitor:', host: 'localhost' }, URL })
  return { bridge: window.PaliroNative, calls, window }
}

test('each native request resolves once and routes errors to its own caller', async () => {
  const { bridge, calls } = nativePage()
  const first = bridge.request('PaliroAuthStorage', 'read')
  const second = bridge.request('PaliroMediaPicker', 'pick', { source: 'library' })
  assert.notEqual(calls[0].id, calls[1].id)
  bridge.receive({ id: calls[1].id, value: { cancelled: true } })
  assert.equal((await second).cancelled, true)
  bridge.receive({ id: calls[0].id, error: { message: 'Denied', code: 'PERMISSION_DENIED' } })
  await assert.rejects(first, error => error.code === 'PERMISSION_DENIED')
  bridge.receive({ id: calls[0].id, value: 'too late' })
})

test('native event listeners subscribe and stop receiving after removal', async () => {
  const { bridge, calls } = nativePage()
  const events = []
  const pending = bridge.addListener('PaliroIap', 'purchaseResult', value => events.push(value))
  bridge.receive({ id: calls[0].id, value: {} })
  const listener = await pending
  bridge.emit('PaliroIap', 'purchaseResult', { transactionID: '123' })
  assert.equal(events.length, 1)
  const removing = listener.remove()
  assert.equal(calls[1].method, '__unlisten')
  bridge.receive({ id: calls[1].id, value: {} })
  await removing
  bridge.emit('PaliroIap', 'purchaseResult', {})
  assert.equal(events.length, 1)
})

test('service adapter uses the native handler, file URLs are encoded, browser stays non-native', async () => {
  assert.equal(paliroNativeService('PaliroVoiceRecorder'), null)
  const { window, bridge, calls } = nativePage()
  globalThis.window = window
  try {
    const service = paliroNativeService('PaliroVoiceRecorder')
    const recording = service.start()
    assert.equal(calls[0].method, 'start')
    assert.equal(calls[0].service, 'PaliroVoiceRecorder')
    bridge.receive({ id: calls[0].id, value: { recording: true } })
    assert.equal((await recording).recording, true)
    assert.equal(paliroNativeFileSource('file:///private/a%20b.m4a'), 'capacitor://localhost/_paliro_file_/private/a%20b.m4a')
    assert.equal(paliroNativeFileSource('/assets/test.mp4'), '/assets/test.mp4')
  } finally { delete globalThis.window }
})

test('bridge is not exposed in a browser or subframe', () => {
  for (const window of [{}, { top: {}, webkit: { messageHandlers: { paliro: {} } } }]) {
    vm.runInNewContext(source, { window })
    assert.equal(window.PaliroNative, undefined)
  }
})

test('native host validates origin, allowlists methods and restricts readable media directories', () => {
  const swift = ['PaliroMoonlitPath', 'PaliroMistyGrove']
    .map(name => readFileSync(new URL(`../../PaDlroliroBox/PaDlroliroBox/${name}.swift`, import.meta.url), 'utf8')).join('\n')
  assert.match(swift, /silkenCuriosityCanvas.frameInfo.isMainFrame/)
  assert.match(swift, /securityOrigin.host == "localhost"/)
  assert.match(swift, /lunarCuriosityCanvas.duskCuriosityCanvas.contains\(crystalExpressionCanvas\)/)
  assert.match(swift, /resolvingSymlinksInPath/)
  assert.match(swift, /PaliroVideos/)
  assert.match(swift, /PaliroVoiceMessages/)
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.ok(!Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).some(name => name.startsWith('@capacitor/')))
})

test('native credentials fall back only to an iOS-protected install-local file when Keychain fails', () => {
  const swift = readFileSync(new URL('../../PaDlroliroBox/PaDlroliroBox/PaliroQuietCove.swift', import.meta.url), 'utf8')
  assert.match(swift, /case \.tranquilCuriosityTrail: return "protectedFile"/)
  assert.match(swift, /completeFileProtectionUntilFirstUserAuthentication/)
  assert.match(swift, /isExcludedFromBackup = true/)
  assert.match(swift, /if mellowWonderTrail == errSecItemNotFound \{ lucentDreamTrail\.dawnThoughtCanvas\(\[:\]\); return \}/)
  assert.match(swift, /SecItemDelete\(tranquilThoughtTrail as CFDictionary\)/)
  assert.match(swift, /try celestialFeelingTrail\(\)/)
  assert.doesNotMatch(swift, /localStorage|sessionStorage/)
})


test('startup credential read times out and ignores late replies; permissions remain unbounded', async () => {
  const scheduled = []
  const { bridge, calls } = nativePage({ setTimeout: (fn, ms) => { scheduled.push({ fn, ms }); return scheduled.length }, clearTimeout() {} })
  const reading = bridge.request('PaliroAuthStorage', 'read')
  const recording = bridge.request('PaliroVoiceRecorder', 'start')
  assert.equal(scheduled.length, 1)
  assert.equal(scheduled[0].ms, 8000)
  scheduled[0].fn()
  await assert.rejects(reading, error => error.code === 'NATIVE_TIMEOUT')
  bridge.receive({ id: calls[0].id, value: { value: 'late' } })
  bridge.receive({ id: calls[1].id, value: { recording: true } })
  assert.equal((await recording).recording, true)
})
