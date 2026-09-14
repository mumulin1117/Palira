import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import { paliroTranslate } from '../src/services/paliroI18n.js'

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
const icons = readFileSync(new URL('../src/components/PaliroChatIcon.vue', import.meta.url), 'utf8')

test('opening or cancelling the profile block confirmation never blocks a member', () => {
  const context = vm.createContext({
    showFriendProfileActions: { value: true },
    showFriendProfileBlockConfirm: { value: false },
  })
  const functions = ['openFriendProfileBlockConfirm', 'closeFriendProfileBlockConfirm']
    .map((name) => source.match(new RegExp(`function ${name}\\([^]*?\\n}`))[0])
    .join('\n')
  vm.runInContext(functions, context)

  context.openFriendProfileBlockConfirm()
  assert.equal(context.showFriendProfileActions.value, false)
  assert.equal(context.showFriendProfileBlockConfirm.value, true)
  context.closeFriendProfileBlockConfirm()
  assert.equal(context.showFriendProfileBlockConfirm.value, false)
})

test('profile blocking runs only after explicit confirmation', () => {
  let blockCalls = 0
  let completionCalls = 0
  const context = vm.createContext({
    showFriendProfileBlockConfirm: { value: false },
    showFriendProfileActions: { value: true },
    session: { value: { userID: 'self' } },
    matchedFriend: { value: { id: 'member-1' } },
    blockedUsers: { value: [] },
    paliroBlockMember() {
      blockCalls++
      return { type: 'success', blockedUsers: [{ id: 'member-1' }] }
    },
    finishFriendSafetyAction() { completionCalls++ },
  })
  vm.runInContext(source.match(/function confirmBlockMatchedFriend\([^]*?\n}/)[0], context)

  context.confirmBlockMatchedFriend()
  assert.equal(blockCalls, 0)
  context.showFriendProfileBlockConfirm.value = true
  context.confirmBlockMatchedFriend()
  assert.equal(blockCalls, 1)
  assert.equal(completionCalls, 1)
  assert.equal(context.blockedUsers.value[0].id, 'member-1')
  assert.equal(context.showFriendProfileBlockConfirm.value, false)
})

test('profile block dialog follows Lanhu version 2 and stays bilingual', () => {
  assert.equal(paliroTranslate('en', 'blockMemberTitle'), 'Block @{name}?')
  assert.equal(paliroTranslate('en', 'blockConfirm'), 'Block')
  assert.equal(paliroTranslate('en', 'blockMemberCopy'), "They won't be able to find your profile, see your posts, or message you.")
  assert.equal(paliroTranslate('ko', 'blockMemberTitle'), '@{name}님을 차단할까요?')
  assert.equal(paliroTranslate('ko', 'blockConfirm'), '차단')
  assert.match(source, /blockMemberDialogTitle/)
  assert.match(source, /@click="openFriendProfileBlockConfirm"/)
  assert.match(source, /@click="confirmBlockMatchedFriend"/)
  assert.match(source, /PaliroChatIcon name="alert"/)
  assert.match(icons, /alert:/)
  assert.match(styles, /\.paliro-profile-block-dialog \{[^}]*width: min\(100%, 312px\)[^}]*min-height: 320px[^}]*border-radius: 24px/)
  assert.match(styles, /\.paliro-profile-block-backdrop \{[^}]*rgba\(0, 0, 0, \.8\)/)
  assert.deepEqual(compileTemplate({ source: parse(source).descriptor.template.content, filename: 'PaliroEntryApp.vue', id: 'paliro-profile-block' }).errors, [])
})
