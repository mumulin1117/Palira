import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { paliroSelectVideo, paliroMediaErrorKey } from '../src/services/paliroVideoSelection.js'
import { paliroSeedUsers, paliroCreateVideoPost, paliroGetPublishedVideos } from '../src/services/paliroLocalStore.js'

const selected = { fileUri: 'file:///private/PaliroVideos/test.mp4', thumbnail: 'data:image/jpeg;base64,dGVzdA==' }
test('native selection forwards only the chosen source, retaining its real video cover', async () => {
  for (const source of ['camera', 'library']) {
    const result = await paliroSelectVideo({ source, nativePicker: { pick: async options => {
      assert.deepEqual(options, { source, mediaType: 'video' })
      return selected
    } }, browserPicker: () => assert.fail('Native must never fall back to an HTML picker') })
    assert.deepEqual(result, { source: selected.fileUri, thumbnail: selected.thumbnail })
  }
})

test('cancel is not an error; denial and invalid previews cannot silently succeed', async () => {
  assert.equal(await paliroSelectVideo({ source: 'library', nativePicker: { pick: async () => ({ cancelled: true }) } }), null)
  await assert.rejects(paliroSelectVideo({ source: 'library', nativePicker: { pick: async () => ({ fileUri: 'test.mp4' }) } }), /preview/)
  const denied = Object.assign(new Error('Camera access was not granted.'), { code: 'PERMISSION_DENIED' })
  await assert.rejects(paliroSelectVideo({ source: 'camera', nativePicker: { pick: async () => { throw denied } } }), error => error === denied)
  assert.equal(paliroMediaErrorKey(denied), 'mediaPermissionDenied')
  assert.equal(paliroMediaErrorKey({ code: 'VIDEO_TOO_LARGE' }), 'videoTooLarge')
})

test('selection blocks duplicate requests and ignores a result after the draft changes', async () => {
  const entry = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
  const code = entry.slice(entry.indexOf('async function pickVideoForPublish('), entry.indexOf('\nfunction publishVideo('))
  let complete, calls = 0
  const context = vm.createContext({
    videoSelectionBusy: { value: false }, videoPublishLoading: { value: false },
    videoPublishError: { value: '' }, showVideoPublish: { value: true },
    videoPublishDraft: { value: { source: '', caption: 'Keep my note' } },
    paliroSelectVideo: () => { calls++; return new Promise(resolve => { complete = resolve }) },
    getPaliroMediaPicker: () => ({}), pickBrowserVideo() {}, paliroMediaErrorKey, t: key => key, URL,
  })
  vm.runInContext(code, context)
  const request = context.pickVideoForPublish('library')
  await context.pickVideoForPublish('library')
  assert.equal(calls, 1)
  complete({ source: selected.fileUri, thumbnail: selected.thumbnail })
  await request
  assert.equal(context.videoPublishDraft.value.caption, 'Keep my note')
  assert.equal(context.videoPublishDraft.value.thumbnail, selected.thumbnail)
  const later = context.pickVideoForPublish('camera')
  const nextDraft = { source: '', caption: 'New draft' }
  context.videoPublishDraft.value = nextDraft
  complete({ source: selected.fileUri, thumbnail: selected.thumbnail })
  await later
  assert.equal(context.videoPublishDraft.value, nextDraft)
  assert.equal(context.videoSelectionBusy.value, false)
})

test('published videos keep the selected cover after rereading persisted data', () => {
  const data = new Map()
  globalThis.window = { localStorage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } }
  try {
    const user = paliroSeedUsers()[0]
    const post = paliroCreateVideoPost(user.id, { source: selected.fileUri, thumbnail: selected.thumbnail, caption: 'My topic', language: 'en' })
    assert.equal(paliroGetPublishedVideos(user.id).find(video => video.id === post.id).thumbnail, selected.thumbnail)
  } finally { delete globalThis.window }
})

test('native media plugins use instance registration, and video capture waits for audio permission', () => {
  const bridge = readFileSync(new URL('../ios/App/App/PaliroBridgeViewController.swift', import.meta.url), 'utf8')
  for (const plugin of ['PaliroMediaPicker', 'PaliroVoiceRecorder', 'PaliroCallPermissions']) {
    assert.ok(bridge.includes(`registerPluginInstance(${plugin}Plugin())`))
  }
  const native = readFileSync(new URL('../ios/App/App/PaliroIapPlugin.swift', import.meta.url), 'utf8')
  const camera = native.slice(native.indexOf('private func openCamera()'), native.indexOf('private func presentCamera()'))
  assert.ok(camera.indexOf('requestAccess(for: .video)') < camera.indexOf('requestAccess(for: .audio)'))
  assert.match(camera, /guard microphone else/)
  assert.match(native, /status == \.authorized \|\| status == \.limited/)
})
