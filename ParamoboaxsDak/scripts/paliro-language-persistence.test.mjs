import assert from 'node:assert/strict'
import test from 'node:test'
import { paliroGetLanguagePreference, paliroSetLanguagePreference, paliroSignOut } from '../src/services/paliroLocalStore.js'

function withStorage(run) {
  const values = new Map()
  const restart = (nativeLanguage) => {
    globalThis.window = {
      __paliroLaunchLanguage: nativeLanguage,
      localStorage: {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
      },
    }
  }
  restart()
  try { run(values, restart) } finally { delete globalThis.window }
}

test('only an installation without a preference defaults to Korean', () => withStorage(() => {
  assert.equal(paliroGetLanguagePreference(), 'ko')
  paliroSetLanguagePreference(null, 'en')
  assert.equal(paliroGetLanguagePreference(), 'en')
}))

test('logout and restart retain either language without changing account data', () => withStorage((values, restart) => {
  values.set('paliro.users', 'untouched accounts')
  values.set('paliro.messages', 'untouched conversations')
  for (const language of ['en', 'ko', 'en']) {
    paliroSetLanguagePreference('member-a', language)
    paliroSignOut()
    restart()
    assert.equal(paliroGetLanguagePreference(), language)
    assert.equal(paliroGetLanguagePreference('member-a'), language)
    assert.equal(values.get('paliro.users'), 'untouched accounts')
    assert.equal(values.get('paliro.messages'), 'untouched conversations')
  }
}))

test('account preferences remain separate from the signed-out App preference', () => withStorage(() => {
  paliroSetLanguagePreference('member-a', 'en')
  paliroSetLanguagePreference('member-b', 'ko')
  assert.equal(paliroGetLanguagePreference('member-a'), 'en')
  assert.equal(paliroGetLanguagePreference('member-b'), 'ko')
  assert.equal(paliroGetLanguagePreference(), 'ko')
}))

test('older native preferences survive upgrade and malformed values fall back safely', () => withStorage((values, restart) => {
  restart('en')
  assert.equal(paliroGetLanguagePreference(), 'en')
  values.set('paliro.appLanguage.v1', '{broken')
  assert.equal(paliroGetLanguagePreference(), 'en')
  paliroSetLanguagePreference(null, 'ko')
  assert.equal(paliroGetLanguagePreference(), 'ko')
  assert.equal(paliroSetLanguagePreference(null, 'unsupported'), 'ko')
}))
