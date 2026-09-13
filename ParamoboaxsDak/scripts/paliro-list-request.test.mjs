import assert from 'node:assert/strict'
import test from 'node:test'
import { usePaliroListRequest } from '../src/services/paliroListRequest.js'

test('simulated requests wait 1–2 seconds, reject duplicate refreshes and retain cached data on failure', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const request = usePaliroListRequest()
  let commits = 0
  const pending = request.run(() => { commits++ })
  assert.equal(request.busy.value, true)
  assert.equal(await request.run(() => { commits++ }), false)
  t.mock.timers.tick(999)
  assert.equal(commits, 0)
  t.mock.timers.tick(1001)
  assert.equal(await pending, true)
  assert.equal(commits, 1)
  const failed = request.run(() => { throw new Error('read failed') })
  t.mock.timers.tick(2000)
  assert.equal(await failed, false)
  assert.equal(request.ready.value, true)
  assert.equal(request.failed.value, true)
  assert.equal(request.busy.value, false)
})

test('changing accounts cancels stale data commits without cancelling the next account request', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const request = usePaliroListRequest()
  let owner = ''
  const old = request.run(() => { owner = 'old' })
  request.reset()
  const current = request.run(() => { owner = 'current' })
  assert.equal(await old, false)
  assert.equal(request.busy.value, true)
  t.mock.timers.tick(2000)
  assert.equal(await current, true)
  assert.equal(owner, 'current')
})
