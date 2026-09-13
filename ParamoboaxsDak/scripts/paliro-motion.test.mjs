import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { parse, compileTemplate } from 'vue/compiler-sfc'

const source = readFileSync(new URL('../src/PaliroEntryApp.vue', import.meta.url), 'utf8')
const overlay = readFileSync(new URL('../src/components/PaliroOverlayTransition.vue', import.meta.url), 'utf8')
const ast = parse(source).descriptor.template.ast
const walk = (node, fn) => { fn(node); node.children?.forEach((child) => walk(child, fn)) }

test('first-login rules wait for the home entrance and support initial appearance', () => {
  let rules
  walk(ast, (node) => {
    if (node.tag === 'Transition' && node.props.some((prop) => prop.name === 'name' && prop.value?.content === 'paliro-rules-sheet')) rules = node
  })
  assert.ok(rules.props.some((prop) => prop.name === 'appear'))
  assert.equal(rules.children.find((node) => node.tag === 'div').props.find((prop) => prop.name === 'if').exp.content, "showBoxRules && route === 'home' && homePageReady")
  const context = vm.createContext({ route: { value: 'login' }, homePageReady: { value: false } })
  vm.runInContext(source.match(/function handlePageEntered\([^]*?\n}/)[0], context)
  const home = { classList: { contains: (name) => name === 'paliro-home' } }
  context.handlePageEntered(home)
  assert.equal(context.homePageReady.value, false)
  context.route.value = 'home'
  context.handlePageEntered({ classList: { contains: () => false } })
  assert.equal(context.homePageReady.value, false)
  context.handlePageEntered(home)
  assert.equal(context.homePageReady.value, true)
})

test('login and signup share the same aligned header without changing form placement', () => {
  let header
  walk(ast, (node) => {
    if (node.tag === 'header' && node.props.some((prop) => prop.name === 'class' && prop.value?.content === 'paliro-auth-nav')) header = node
  })
  assert.equal(header.children.filter((node) => node.tag === 'button').length, 1)
  assert.equal(header.children.filter((node) => node.tag === 'h1').length, 2)
  assert.equal(header.children.some((node) => node.tag === 'input'), false)
})

test('primary pages crossfade concurrently while secondary pages retain their transition mode', () => {
  let transition
  walk(ast, (node) => {
    if (node.tag === 'Transition' && node.props.some((prop) => prop.arg?.content === 'name')) transition = node
  })
  assert.equal(transition.props.find((prop) => prop.arg?.content === 'mode').exp.content, "isPrimaryTabTransition ? undefined : 'out-in'")
  assert.equal(transition.props.find((prop) => prop.arg?.content === 'css').exp.content, '!skipVideoRouteAnimation')
})

test('all standard overlays share entry and exit motion without altering their conditional state', () => {
  const conditions = new Map()
  walk(ast, (node) => {
    if (node.tag !== 'PaliroOverlayTransition') return
    const child = node.children.find((item) => item.type === 1)
    conditions.set(child.props.find((prop) => prop.name === 'if').exp.content.split(' ')[0],
      node.props.find((prop) => prop.name === 'kind')?.value.content ?? 'dialog')
  })
  assert.equal(conditions.size, 17)
  for (const name of ['showVideoComments', 'showVideoActions', 'showFriendProfileActions', 'showVideoPublish']) assert.equal(conditions.get(name), 'sheet')
  for (const name of ['profileReminder', 'showFriendProfileBlockConfirm', 'showEula', 'showCoinPrompt']) assert.equal(conditions.get(name), 'dialog')
  assert.equal(conditions.has('isOpeningBox'), false)
  for (const [filename, text] of [['entry.vue', source], ['overlay.vue', overlay]]) {
    assert.deepEqual(compileTemplate({ source: parse(text).descriptor.template.content, filename, id: filename }).errors, [])
  }
})

test('outgoing overlays cannot be submitted twice and a rapid reopen restores interaction', () => {
  let blurred = 0
  const focused = { blur() { blurred++ } }
  const context = vm.createContext({ document: { activeElement: focused } })
  const functions = ['prepareOverlay', 'retireOverlay'].map((name) => overlay.match(new RegExp(`function ${name}\\([^]*?\\n}`))[0]).join('\n')
  vm.runInContext(functions, context)
  const attributes = new Map()
  const element = { inert: false, contains: (target) => target === focused,
    setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key) }
  context.retireOverlay(element)
  assert.equal(element.inert, true)
  assert.equal(attributes.get('aria-hidden'), 'true')
  assert.equal(blurred, 1)
  context.prepareOverlay(element)
  assert.equal(element.inert, false)
  assert.equal(attributes.has('aria-hidden'), false)
})
