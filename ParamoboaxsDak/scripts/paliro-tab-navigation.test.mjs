import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse } from 'vue/compiler-sfc'
import { paliroPrimaryTabs, paliroRouteTransition } from '../src/services/paliroNavigation.js'

test('all primary tab pairs animate, including entering and leaving videos', () => {
  for (const from of paliroPrimaryTabs) {
    for (const to of paliroPrimaryTabs) {
      if (from === to) continue
      assert.deepEqual(paliroRouteTransition(from.route, to.route), { primary: true, skipVideo: false })
    }
  }
})

test('profile entrances share standard motion from video, Box, relationships and messages', () => {
  for (const from of ['videos', 'home', 'social-detail', 'messages', 'conversation']) {
    assert.deepEqual(paliroRouteTransition(from, 'friend-profile'), { primary: false, skipVideo: false })
  }
})

test('returning from profile preserves immediate video recovery and other transitions', () => {
  assert.deepEqual(paliroRouteTransition('friend-profile', 'videos'), { primary: false, skipVideo: true })
  assert.deepEqual(paliroRouteTransition('videos', 'video-publish'), { primary: false, skipVideo: true })
  assert.deepEqual(paliroRouteTransition('messages', 'conversation'), { primary: false, skipVideo: false })
})

test('the only primary navigation is a shell sibling, outside all page transitions', () => {
  const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
  const shell = parse(source).descriptor.template.ast.children.find((node) => node.tag === 'main')
  const isTabs = (node) => node.props?.some((prop) => prop.name === 'class' && prop.value?.content.split(' ').includes('paliro-home-tabs'))
  const nav = shell.children.find(isTabs)
  assert.ok(nav)
  assert.match(nav.props.find((prop) => prop.name === 'if').exp.content, /session && paliroPrimaryTabs.some/)
  let count = 0
  const walk = (node) => { if (isTabs(node)) count++; node.children?.forEach(walk) }
  walk(shell)
  assert.equal(count, 1)
  assert.equal(nav.children.find((node) => node.tag === 'button').props.find((prop) => prop.name === 'for').exp.content, 'tab in paliroPrimaryTabs')
})
