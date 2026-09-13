import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse } from 'vue/compiler-sfc'
import { PALIRO_BOX_OPENING_MOTION } from '../src/services/paliroBrandMotion.js'
import { paliroSeedUsers, paliroCreateVideoPost, paliroAwardVideoBoxAction, paliroGetPublishedVideos } from '../src/services/paliroLocalStore.js'

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const extract = (...names) => names.map((name) => source.match(new RegExp(`function ${name}\\([^]*?\\n}`))[0]).join('\n')

test('opening has one draw, a shorter coordinated reveal, and a reduced-motion path', () => {
  for (const reduced of [false, true]) {
    const timers = []
    let draws = 0
    const context = vm.createContext({
      PALIRO_BOX_OPENING_MOTION, session: { value: { userID: 'self' } }, languagePreference: { value: 'en' },
      matchedFriend: { value: null }, friendRequestStatus: { value: '' }, homeNotice: { value: '' },
      boxOpeningStage: { value: 'idle' }, boxOpeningKey: { value: 0 }, t: (key) => key,
      paliroTakeAvailableMatchMember: () => { draws++; return { id: 'member' } }, paliroGetFriendRequestStatus: () => 'none',
      clearOpeningTimers() {}, document: { activeElement: null }, HTMLElement: class {}, paliroOpeningPreviousFocus: null,
      window: { matchMedia: () => ({ matches: reduced }) }, scheduleOpeningStep: (callback, delay) => timers.push({ callback, delay }),
      nextTick: (callback) => callback(), focusMatchResultAction() {},
    })
    context.isOpeningBox = { get value() { return context.boxOpeningStage.value !== 'idle' } }
    vm.runInContext(extract('startTakeOneOpening', 'showMatchResult'), context)
    context.startTakeOneOpening()
    context.startTakeOneOpening()
    assert.equal(draws, 1)
    assert.deepEqual(timers.map((timer) => timer.delay), reduced ? [180] : [800, 1400])
    timers.forEach((timer) => timer.callback())
    assert.equal(context.boxOpeningStage.value, 'result')
  }
  assert.ok(PALIRO_BOX_OPENING_MOTION.resultAt + PALIRO_BOX_OPENING_MOTION.settleDuration <= 1800)
})

test('selection does not replay for the same box or change during opening', () => {
  let notices = 0
  const context = vm.createContext({ selectedBox: { value: null }, boxSelectionAnimating: { value: null }, isBoxActionLocked: { value: false },
    paliroBoxSelectionAlertTimer: null, boxSelectionAlertActive: { value: false }, homeNotice: { value: '' },
    t: (key) => { notices++; return key }, window: { clearTimeout() {} } })
  vm.runInContext(extract('selectBox'), context)
  context.selectBox(1)
  context.selectBox(1)
  assert.equal(notices, 1)
  context.selectBox(2)
  assert.equal(context.selectedBox.value, 2)
  context.isBoxActionLocked.value = true
  context.selectBox(3)
  assert.equal(context.selectedBox.value, 2)
})

test('successful publishing rewards once per day and repeated confirm/submit cannot duplicate posts', () => {
  const values = new Map()
  globalThis.window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }
  try {
    const userID = paliroSeedUsers()[0].id
    const context = vm.createContext({ session: { value: { userID } }, languagePreference: { value: 'en' },
      showVideoPublish: { value: true }, videoPublishLoading: { value: false },
      videoPublishDraft: { value: { source: '/test.mp4', caption: 'First post' } }, videoPublishError: { value: '' },
      boxState: { value: null }, videoRewardPending: { value: false }, showVideoPublishReward: { value: false },
      paliroCreateVideoPost, paliroAwardVideoBoxAction, loadMeState() {}, loadVideoFeed() {},
      nextTick: (callback) => callback(), videoFeedScroll: { value: null }, t: (key) => key,
    })
    vm.runInContext(extract('publishVideo', 'finishVideoRewardFeedback'), context)
    context.publishVideo()
    context.publishVideo()
    assert.equal(paliroGetPublishedVideos(userID).length, 1)
    assert.equal(context.videoRewardPending.value, true)
    assert.equal(context.showVideoPublishReward.value, true)
    assert.equal(context.boxState.value.videoBonusActions, 1)
    const element = {}
    context.finishVideoRewardFeedback({ animationName: 'paliro-reward-progress', target: {}, currentTarget: element })
    assert.equal(context.videoRewardPending.value, true)
    context.finishVideoRewardFeedback({ animationName: 'paliro-reward-progress-reduced', target: element, currentTarget: element })
    assert.equal(context.videoRewardPending.value, false)
    context.showVideoPublish.value = true
    context.showVideoPublishReward.value = false
    context.publishVideo()
    assert.equal(paliroGetPublishedVideos(userID).length, 2)
    assert.equal(context.showVideoPublishReward.value, false)
    assert.equal(context.videoRewardPending.value, false)
    assert.equal(context.boxState.value.videoBonusActions, 1)
  } finally { delete globalThis.window }
})

test('a failed publication never triggers rewards or closes the draft', () => {
  const context = vm.createContext({ session: { value: { userID: 'self' } }, languagePreference: { value: 'ko' },
    showVideoPublish: { value: true }, videoPublishLoading: { value: false },
    videoPublishDraft: { value: { source: '/test.mp4', caption: 'Test' } }, videoPublishError: { value: '' },
    videoRewardPending: { value: false }, showVideoPublishReward: { value: false }, t: (key) => key,
    paliroCreateVideoPost: () => null, paliroAwardVideoBoxAction: () => assert.fail('No reward before persistence'),
  })
  vm.runInContext(extract('publishVideo'), context)
  context.publishVideo()
  assert.equal(context.showVideoPublish.value, true)
  assert.equal(context.videoPublishLoading.value, false)
  assert.equal(context.videoRewardPending.value, false)
  assert.equal(context.showVideoPublishReward.value, false)
})

test('reaction effects do not animate on initial render and use confirmed values as their keys', () => {
  const component = parse(readFileSync(new URL('../src/components/PaliroStateFeedback.vue', import.meta.url), 'utf8')).descriptor.template.ast
  const transition = component.children.find((node) => node.tag === 'span').children.find((node) => node.tag === 'Transition')
  assert.equal(transition.props.some((prop) => prop.name === 'appear'), false)
  assert.ok(transition.props.some((prop) => prop.name === 'on' && prop.arg.content === 'before-enter'))
  const css = readFileSync(new URL('../src/paliroMotion.css', import.meta.url), 'utf8')
  assert.match(css, /\.paliro-state-like-enter-active\.is-positive \{ animation: paliro-like-confirm/)
  assert.match(css, /prefers-reduced-motion: reduce/)
})
