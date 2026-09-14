import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'vue/compiler-sfc'
import { paliroSeedUsers, paliroGetSocialState, paliroGetSocialSummary, paliroToggleFollowMember, paliroCanChatWithMember } from '../src/services/paliroLocalStore.js'
import { paliroTranslate } from '../src/services/paliroI18n.js'

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
test('profile follow toggles persist and mutual permissions update in both languages', () => {
  const values = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  try {
    const userID = paliroSeedUsers()[0].id
    for (const language of ['en', 'ko']) {
      const social = paliroGetSocialState(userID, language)
      const member = social.following.find(m => social.followers.some(f => f.id === m.id))
      assert.ok(member)
      let refreshes = 0
      const context = vm.createContext({
        session: { value: { userID } }, matchedFriend: { value: member },
        isMatchedBlocked: { value: false }, languagePreference: { value: language },
        socialState: { value: social }, profileMeta: { value: null },
        paliroToggleFollowMember, paliroGetSocialSummary,
        loadMessageState() { refreshes++ },
      })
      vm.runInContext(source.match(/function followMatchedFriend\([^]*?\n}/)[0], context)
      context.followMatchedFriend()
      assert.equal(paliroGetSocialState(userID, language).following.some(m => m.id === member.id), false)
      assert.equal(paliroCanChatWithMember(userID, member.id), false)
      context.followMatchedFriend()
      assert.equal(paliroGetSocialState(userID, language).following.filter(m => m.id === member.id).length, 1)
      assert.equal(paliroCanChatWithMember(userID, member.id), true)
      assert.equal(refreshes, 2)
      context.isMatchedBlocked.value = true
      context.followMatchedFriend()
      assert.equal(refreshes, 2)
    }
  } finally { delete globalThis.window }
})

test('followed profile button remains clickable and announces the unfollow action', () => {
  let button
  const walk = (node) => {
    if (node.tag === 'button' && node.props.some(p => p.name === 'on' && p.exp?.content === 'followMatchedFriend')) button = node
    node.children?.forEach(walk)
  }
  walk(parse(source).descriptor.template.ast)
  assert.ok(button)
  const binding = (name) => button.props.find(p => p.name === 'bind' && p.arg?.content === name)?.exp?.content
  assert.equal(binding('disabled'), 'isMatchedBlocked')
  assert.equal(binding('aria-pressed'), 'isMatchedFollowing')
  assert.match(binding('aria-label'), /t\('unfollow'\)/)
})

test('a non-mutual profile message opens the localized Lanhu reminder', () => {
  const context = vm.createContext({
    isMatchedMutualFriend: { value: false },
    profileReminder: { value: '' },
  })
  vm.runInContext(source.match(/function openMatchedConversation\([^]*?\n}/)[0], context)
  context.openMatchedConversation()

  assert.equal(context.profileReminder.value, 'message')
  assert.match(source, /'is-mutual-only': profileReminder === 'message'/)
  assert.match(source, /paliro-mutual-friend-reminder@2x\.png/)
  assert.match(styles, /\.paliro-profile-reminder\.is-mutual-only \{[^}]*width: min\(100%, 312px\)[^}]*min-height: 330px/)
  assert.ok(existsSync(new URL('../public/assets/paliro-mutual-friend-reminder@2x.png', import.meta.url)))
  assert.ok(existsSync(new URL('../public/assets/paliro-mutual-friend-reminder@3x.png', import.meta.url)))
  assert.equal(paliroTranslate('en', 'messageMutualOnlyTitle'), 'Reminder')
  assert.equal(paliroTranslate('en', 'messageMutualOnlyCopy'), 'You need to add each other as friends before you can chat or video call.')
  assert.equal(paliroTranslate('ko', 'messageMutualOnlyCopy'), '서로 친구가 되어야 채팅이나 영상 통화를 할 수 있습니다.')
})
