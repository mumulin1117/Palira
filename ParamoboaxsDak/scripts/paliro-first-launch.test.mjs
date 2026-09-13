import assert from 'node:assert/strict'
import test from 'node:test'
import { claimPaliroFirstLaunch, PALIRO_INTRO_DURATION } from '../src/services/paliroFirstLaunch.js'

function storage(initial = []) {
  const values = new Map(initial)
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values }
}

test('fresh installs play once and a clean reinstall can play again', () => {
  const installed = storage()
  assert.equal(claimPaliroFirstLaunch(installed), true)
  assert.equal(claimPaliroFirstLaunch(installed), false)
  assert.equal(claimPaliroFirstLaunch(storage()), true)
  assert.ok(PALIRO_INTRO_DURATION < 4000)
})

test('existing installations skip the introduction without changing consent or account data', () => {
  for (const key of ['paliro.eulaAccepted', 'paliro.localUsers', 'paliro.session']) {
    const installed = storage([[key, 'existing']])
    assert.equal(claimPaliroFirstLaunch(installed), false)
    assert.equal(installed.getItem(key), 'existing')
  }
})

test('unavailable storage does not block startup', () => {
  assert.equal(claimPaliroFirstLaunch({ getItem() { throw new Error('unavailable') } }), false)
})
