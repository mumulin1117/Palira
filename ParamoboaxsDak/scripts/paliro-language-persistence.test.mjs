import assert from 'node:assert/strict'
import test from 'node:test'
import { paliroGetLanguagePreference, paliroSetLanguagePreference, paliroSignOut, paliroAcceptServerUser, paliroGetMockMembers, paliroGetVideoFeed, paliroGetAvailableMatchMembers } from '../src/services/paliroLocalStore.js'
import { paliroResolveLanguage } from '../src/services/paliroLanguage.js'
import { PALIRO_LOCALES, paliroTranslate, paliroGetLegalCopy } from '../src/services/paliroI18n.js'

function withStorage(run) {
  const values = new Map()
  const restart = (nativeLanguage) => {
    globalThis.window = { __paliroLaunchLanguage: nativeLanguage, localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    } }
  }
  restart()
  try { run(values, restart) } finally { delete globalThis.window }
}

test('only a Korean primary device language selects Korean on first install', () => {
  for (const deviceLanguage of ['ko', 'ko-KR', 'ko_KR', 'KO-kr', 'ko-KP']) {
    assert.equal(paliroResolveLanguage({ deviceLanguage }), 'ko')
  }
  for (const deviceLanguage of ['en-US', 'zh-CN', 'zh-Hant', 'ja-JP', 'fr-FR', 'ar', 'ru', '', undefined]) {
    assert.equal(paliroResolveLanguage({ deviceLanguage }), 'en')
  }
})

test('initial choice is saved and restart does not replace it with the device language', () => withStorage((values, restart) => {
  restart('en')
  assert.equal(paliroGetLanguagePreference(), 'en')
  assert.equal(JSON.parse(values.get('paliro.appLanguage.v1')), 'en')
  restart('ko')
  assert.equal(paliroGetLanguagePreference(), 'en')
}))

test('logout, restart and other accounts retain the current installation choice', () => withStorage((values, restart) => {
  values.set('paliro.localUsers', 'untouched accounts')
  values.set('paliro.conversations', 'untouched conversations')
  values.set('paliro.languagePreference.v2', JSON.stringify({ oldAccount: 'ko' }))
  for (const language of ['en', 'ko', 'en']) {
    paliroSetLanguagePreference('member-a', language)
    paliroSignOut()
    restart(language === 'en' ? 'ko' : 'en')
    assert.equal(paliroGetLanguagePreference(), language)
    assert.equal(paliroGetLanguagePreference('oldAccount'), language)
    assert.equal(values.get('paliro.localUsers'), 'untouched accounts')
    assert.equal(values.get('paliro.conversations'), 'untouched conversations')
  }
}))

test('older native preferences survive upgrades and malformed values fall back safely', () => withStorage((values, restart) => {
  restart('en')
  values.set('paliro.appLanguage.v1', '{broken')
  assert.equal(paliroGetLanguagePreference(), 'en')
  paliroSetLanguagePreference(null, 'ko')
  assert.equal(paliroSetLanguagePreference(null, 'unsupported'), 'ko')
}))

test('clean reinstall uses device language again instead of the previous preference', () => withStorage((values, restart) => {
  paliroSetLanguagePreference(null, 'ko')
  values.clear() // A new sandbox, not logout or offloading.
  restart('en')
  assert.equal(paliroGetLanguagePreference(), 'en')
  paliroSetLanguagePreference(null, 'en')
  values.clear()
  restart('ko')
  assert.equal(paliroGetLanguagePreference(), 'ko')
}))

test('server login cannot overwrite the installation choice, including after reinstall', () => withStorage((values, restart) => {
  const user = { id: 'language-member', email: 'language@example.test', profileComplete: true,
    profile: { nickname: 'Member', avatar: 'blue', language: 'ko' } }
  restart('en')
  paliroAcceptServerUser(user)
  assert.equal(paliroGetLanguagePreference(user.id), 'en')
  paliroSetLanguagePreference(user.id, 'ko')
  paliroAcceptServerUser({ ...user, profile: { ...user.profile, language: 'en' } })
  assert.equal(paliroGetLanguagePreference(user.id), 'ko')
}))

test('discovery, video and Box defaults follow the selected installation language', () => withStorage(() => {
  const session = paliroAcceptServerUser({ id: '80962768-0000-4000-8000-000000000001', isTestAccount: true,
    email: 'paliro@gmail.com', profileComplete: true, profile: { nickname: 'Member', language: 'ko' } })
  for (const language of ['en', 'ko', 'en']) {
    paliroSetLanguagePreference(session.userID, language)
    for (const list of [paliroGetMockMembers(), paliroGetVideoFeed(session.userID), paliroGetAvailableMatchMembers(session.userID)]) {
      assert.ok(list.length > 0)
      assert.ok(list.every(item => item.language === language))
    }
  }
}))

test('language options and unsupported-copy fallback are localized', () => {
  assert.deepEqual(PALIRO_LOCALES.map(option => paliroTranslate('en', option.labelKey)), ['Korean', 'English'])
  assert.deepEqual(PALIRO_LOCALES.map(option => paliroTranslate('ko', option.labelKey)), ['한국어', '영어'])
  assert.equal(paliroTranslate('ja', 'home'), 'Home')
  assert.equal(paliroGetLegalCopy('ja', 'eula'), paliroGetLegalCopy('en', 'eula'))
})
