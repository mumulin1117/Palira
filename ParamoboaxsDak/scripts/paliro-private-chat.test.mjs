import assert from 'node:assert/strict'
import test from 'node:test'
import { createPaliroVoiceSession, paliroVoiceDuration } from '../src/services/paliroVoiceSession.js'
import { paliroSeedUsers, paliroGetSocialState, paliroGetOrCreateConversation, paliroGetConversation, paliroSendConversationMessage, paliroSendConversationAudioMessage, paliroBlockMember } from '../src/services/paliroLocalStore.js'

test('missing and non-finite native durations use the measured recording time', () => {
  for (const result of [null, {}, { durationSeconds: NaN }, { durationSeconds: Infinity }]) {
    assert.equal(paliroVoiceDuration(result, 1.25), 1.25)
  }
  assert.equal(paliroVoiceDuration({ durationMilliseconds: 1400 }, 0), 1.4)
})

test('unavailable native input preserves its error code, creates no draft and allows retry', async () => {
  let attempts = 0
  const session = createPaliroVoiceSession({ nativeRecorder: {
    start: async () => {
      if (++attempts === 1) throw Object.assign(new Error('Microphone input is unavailable.'), { code: 'AUDIO_INPUT_UNAVAILABLE' })
    },
    stop: async () => ({ fileUri: 'file:///paliro-voice-retry.m4a', durationSeconds: 2 }),
  } })
  await assert.rejects(session.start(), { code: 'AUDIO_INPUT_UNAVAILABLE' })
  assert.equal(await session.stop(), null)
  assert.equal(await session.start(), true)
  assert.equal((await session.stop()).durationSeconds, 2)
})

test('cancel waits for microphone permission and cleans up a late native start', async () => {
  let allow
  let active = false
  const session = createPaliroVoiceSession({ nativeRecorder: {
    start: () => new Promise((resolve) => { allow = () => { active = true; resolve() } }),
    cancel: async () => { active = false },
  } })
  const starting = session.start()
  await Promise.resolve()
  const cancelling = session.cancel()
  allow()
  assert.equal(await starting, false)
  await cancelling
  assert.equal(active, false)
})

test('paused time is excluded, and repeated stops return the same recording', async () => {
  let time = 0
  let stops = 0
  const session = createPaliroVoiceSession({ now: () => time, nativeRecorder: {
    start: async () => {}, pause: async () => {}, resume: async () => {},
    stop: async () => { stops++; return { fileUri: 'file:///voice.m4a' } },
  } })
  await session.start()
  time = 600
  await session.pause()
  time = 10600
  assert.equal(session.duration(), .6)
  await session.resume()
  time = 11300
  const draft = await session.stop()
  assert.ok(Math.abs(draft.durationSeconds - 1.3) < 0.001)
  assert.equal(await session.stop(), draft)
  assert.equal(stops, 1)
})

test('cancelling a completed unsent recording discards only that draft', async () => {
  const discarded = []
  const session = createPaliroVoiceSession({ nativeRecorder: {
    start: async () => {}, stop: async () => ({ fileUri: 'file:///voice.m4a', durationSeconds: 2 }),
    cancel: async () => {}, discard: async ({ fileUri }) => discarded.push(fileUri),
  } })
  await session.start()
  await session.stop()
  await session.cancel()
  assert.deepEqual(discarded, ['file:///voice.m4a'])
  discarded.length = 0
  await session.start()
  await session.stop()
  session.commit()
  await session.cancel()
  assert.deepEqual(discarded, [])
})

test('browser recording saves replayable audio data and releases the microphone', async () => {
  let stopped = false
  let time = 0
  class Recorder extends EventTarget {
    static isTypeSupported() { return true }
    mimeType = 'audio/webm'
    state = 'inactive'
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      const event = new Event('dataavailable')
      event.data = new Blob(['test audio'], { type: this.mimeType })
      this.dispatchEvent(event)
      this.dispatchEvent(new Event('stop'))
    }
  }
  const session = createPaliroVoiceSession({ now: () => time, Recorder,
    mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() { stopped = true } }] }) },
    readBlob: async (blob) => `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`,
  })
  await session.start()
  time = 1500
  const draft = await session.stop()
  assert.match(draft.source, /^data:audio\/webm;base64,/)
  assert.equal(draft.durationSeconds, 1.5)
  assert.equal(stopped, true)
})

test('text and audio persist for mutual friends; short, transient and blocked sends fail', () => {
  const values = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  try {
    const userID = paliroSeedUsers()[0].id
    const social = paliroGetSocialState(userID)
    const friend = social.following.find((item) => social.followers.some((follower) => item.id === follower.id))
    assert.ok(friend)
    paliroGetOrCreateConversation(userID, friend)
    assert.equal(paliroSendConversationMessage(userID, friend.id, '  Hello 안녕  ').type, 'success')
    assert.equal(paliroGetConversation(userID, friend.id).messages.at(-1).body, 'Hello 안녕')
    const audio = { source: 'data:audio/webm;base64,dGVzdA==', durationSeconds: 1.5 }
    assert.equal(paliroSendConversationAudioMessage(userID, friend.id, audio).type, 'success')
    assert.equal(paliroGetConversation(userID, friend.id).messages.at(-1).source, audio.source)
    for (const durationSeconds of [0, .99, NaN, Infinity, 301]) {
      assert.equal(paliroSendConversationAudioMessage(userID, friend.id, { ...audio, durationSeconds }).type, 'invalid-audio')
    }
    assert.equal(paliroSendConversationAudioMessage(userID, friend.id, { ...audio, source: 'blob:temporary' }).type, 'invalid-audio')
    paliroBlockMember(userID, friend)
    assert.equal(paliroSendConversationMessage(userID, friend.id, 'blocked').type, 'not-friends')
    assert.equal(paliroSendConversationAudioMessage(userID, friend.id, audio).type, 'not-friends')
  } finally { delete globalThis.window }
})
