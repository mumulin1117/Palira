import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { parse } from 'vue/compiler-sfc'

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const functions = [
  'setVideoElement', 'clearVideoFeedPlayback', 'captureVideoFeedState',
  'setVideoFeedPlayback', 'playActiveVideo', 'setupVideoFeedPlayback',
  'positionVideoFeedViewport', 'restoreVideoFeedViewport', 'toggleVideoPlayback',
].map((name) => {
  const match = source.match(new RegExp(`function ${name}\\([^]*?\\n}`))
  assert.ok(match, `Missing playback function: ${name}`)
  return match[0]
}).join('\n')

function createPlaybackHarness() {
  const pendingTicks = []
  const observers = []
  const root = {
    scrollTop: 1200,
    querySelector(selector) {
      return { offsetTop: Number(selector.match(/\d+/)[0]) * 600 }
    },
    scrollTo({ top }) { this.scrollTop = top },
  }
  const context = vm.createContext({
    route: { value: 'videos' },
    document: { hidden: false },
    videoFeed: { value: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    activeVideoIndex: { value: 2 },
    videoFeedScroll: { value: root },
    videoFeedPlayback: { value: {} },
    videoReturnState: { value: {} },
    isVideoFeedRestoring: { value: false },
    userPausedVideoID: { value: '' },
    videoElements: new Map(),
    videoFeedObserver: null,
    videoPlaybackRevision: 0,
    paliroVideoRestorePending: false,
    nextTick: (callback) => pendingTicks.push(callback),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this) }
      observe() {}
      disconnect() { this.disconnected = true }
    },
  })
  context.activeVideo = { get value() { return context.videoFeed.value[context.activeVideoIndex.value] } }
  vm.runInContext(functions, context)
  for (const { id } of context.videoFeed.value) {
    const media = {
      currentTime: id === 'c' ? 8.5 : 0,
      paused: true,
      playCount: 0,
      pauseCount: 0,
      play() {
        this.playCount += 1
        this.paused = false
        context.setVideoFeedPlayback(id, true)
        return Promise.resolve()
      },
      pause() {
        this.pauseCount += 1
        this.paused = true
        context.setVideoFeedPlayback(id, false)
      },
      closest() { return { dataset: { videoIndex: String(context.videoFeed.value.findIndex((item) => item.id === id)) } } },
    }
    context.setVideoElement(id, media)
  }
  return {
    context, root, observers,
    flushTicks() { while (pendingTicks.length) pendingTicks.shift()() },
  }
}

test('profile round trip retains the selected player, offset and playback time', () => {
  const { context: c, root, flushTicks } = createPlaybackHarness()
  const original = c.videoElements.get('c')
  c.playActiveVideo(2)
  c.captureVideoFeedState()
  c.clearVideoFeedPlayback()
  c.route.value = 'friend-profile'
  assert.equal(original.paused, true)
  c.route.value = 'videos'
  c.paliroVideoRestorePending = true
  c.isVideoFeedRestoring.value = true
  c.restoreVideoFeedViewport()
  flushTicks()
  assert.equal(c.videoElements.get('c'), original)
  assert.equal(root.scrollTop, 1200)
  assert.equal(original.currentTime, 8.5)
  assert.equal(original.paused, false)
  assert.equal(c.userPausedVideoID.value, '')
  assert.equal(c.videoElements.get('a').paused, true)
  assert.equal(c.videoElements.get('b').paused, true)
})

test('observer notifications for the same slide respect a manual pause', () => {
  const { context: c, observers, flushTicks } = createPlaybackHarness()
  c.setupVideoFeedPlayback()
  flushTicks()
  c.toggleVideoPlayback(c.activeVideo.value)
  const media = c.videoElements.get('c')
  observers[0].callback([{ isIntersecting: true, intersectionRatio: 1, target: media.closest() }])
  assert.equal(media.paused, true)
  assert.equal(c.userPausedVideoID.value, 'c')
  c.toggleVideoPlayback(c.activeVideo.value)
  assert.equal(media.paused, false)
  assert.equal(c.userPausedVideoID.value, '')
})

test('queued setup and old observer callbacks cannot restart an offscreen player', () => {
  const { context: c, observers, flushTicks } = createPlaybackHarness()
  c.setupVideoFeedPlayback()
  c.clearVideoFeedPlayback()
  c.route.value = 'friend-profile'
  flushTicks()
  assert.equal(observers.length, 0)
  c.route.value = 'videos'
  c.setupVideoFeedPlayback()
  flushTicks()
  const oldObserver = observers[0]
  c.clearVideoFeedPlayback()
  c.setupVideoFeedPlayback()
  flushTicks()
  oldObserver.callback([{ isIntersecting: true, intersectionRatio: 1, target: c.videoElements.get('a').closest() }])
  assert.equal(c.activeVideoIndex.value, 2)
  c.route.value = 'friend-profile'
  c.setVideoFeedPlayback('c', true)
  assert.equal(c.videoElements.get('c').paused, true)
})

test('a removed or blocked video falls back to an available slide', () => {
  const { context: c, root, flushTicks } = createPlaybackHarness()
  c.captureVideoFeedState()
  c.clearVideoFeedPlayback()
  c.videoFeed.value = [{ id: 'a' }, { id: 'b' }]
  c.videoElements.delete('c')
  c.paliroVideoRestorePending = true
  c.restoreVideoFeedViewport()
  flushTicks()
  assert.equal(c.activeVideoIndex.value, 1)
  assert.equal(root.scrollTop, 600)
  assert.equal(c.videoElements.get('b').paused, false)
})

test('a late rejected play request does not show a pause icon after leaving', async () => {
  const { context: c } = createPlaybackHarness()
  let rejectPlay
  c.videoElements.get('c').play = () => new Promise((resolve, reject) => { rejectPlay = reject })
  c.playActiveVideo(2)
  c.clearVideoFeedPlayback()
  c.route.value = 'friend-profile'
  rejectPlay(new Error('interrupted'))
  await Promise.resolve()
  assert.equal(c.userPausedVideoID.value, '')
})

test('the feed remains mounted outside the route transition without autoplay', () => {
  const ast = parse(source).descriptor.template.ast
  const shell = ast.children.find((node) => node.tag === 'main')
  const feed = shell.children.find((node) => node.props?.some((prop) => prop.name === 'class' && prop.value?.content.includes('paliro-video-feed ')))
  assert.ok(feed, 'The feed must be a persistent sibling of the route transition')
  const condition = feed.props.find((prop) => prop.name === 'if')
  assert.equal(condition.exp.content, 'hasOpenedVideoFeed && session')
  const walk = (node) => {
    if (node.tag === 'video') assert.equal(node.props.some((prop) => prop.name === 'autoplay'), false)
    node.children?.forEach(walk)
  }
  walk(feed)
})

test('one title-free publish header belongs to the feed, never to a video slide', () => {
  const ast = parse(source).descriptor.template.ast
  const hasClass = (node, name) => node.props?.some((prop) => prop.name === 'class' && prop.value?.content.split(' ').includes(name))
  const shell = ast.children.find((node) => node.tag === 'main')
  const feed = shell.children.find((node) => hasClass(node, 'paliro-video-feed'))
  const header = feed.children.find((node) => hasClass(node, 'paliro-video-header'))
  assert.ok(header, 'The publish header must be outside the scrolling list')
  let headers = 0
  const walk = (node) => {
    if (hasClass(node, 'paliro-video-header')) headers++
    assert.notEqual(node.tag, 'h1', 'The video feed must not display a Video title')
    node.children?.forEach(walk)
  }
  walk(feed)
  assert.equal(headers, 1)
  const button = header.children.find((node) => node.tag === 'button')
  assert.ok(button.props.some((prop) => prop.name === 'on' && prop.arg?.content === 'click' && prop.exp?.content === 'openVideoPublish'))
})
