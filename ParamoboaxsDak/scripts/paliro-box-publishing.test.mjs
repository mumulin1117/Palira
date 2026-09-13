import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.dirname(scriptsDirectory)

function createLocalStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('a published Box retains the exact selected image through local persistence', async () => {
  globalThis.window = { localStorage: createLocalStorage() }
  const store = await import(`../src/services/paliroLocalStore.js?publishing=${Date.now()}`)
  const selectedImage = 'data:image/jpeg;base64,cGFsaXJvLXNlbGVjdGVkLWltYWdl'
  const post = store.paliroCreateBoxPost('paliro-publishing-test', {
    theme: 'Photography',
    title: 'Selected light',
    description: 'The same selected image should appear in My Posts.',
    interests: ['Photography'],
    images: [selectedImage],
  })

  assert.ok(post)
  assert.equal(post.images[0], selectedImage)
  const persistedPost = store.paliroGetSocialState('paliro-publishing-test').posts[0]
  assert.equal(persistedPost.images[0], selectedImage)
})

test('publishing cannot silently create a Box after every selected image is rejected', async () => {
  globalThis.window = { localStorage: createLocalStorage() }
  const store = await import(`../src/services/paliroLocalStore.js?invalid=${Date.now()}`)
  const post = store.paliroCreateBoxPost('paliro-invalid-image-test', {
    description: 'This incomplete post must not be saved.',
    images: ['https://example.com/not-local-image.jpg'],
  })

  assert.equal(post, null)
  assert.equal(store.paliroGetSocialState('paliro-invalid-image-test').posts.length, 0)
})

test('My Posts derives its cover from the first selected image', async () => {
  const source = await readFile(path.join(projectDirectory, 'src', 'PaliroEntryApp.vue'), 'utf8')
  assert.match(source, /coverImage: post\.images\?\.\[0\] \?\? ''/)
  assert.match(source, /<img v-if="post\.coverImage" :src="post\.coverImage"/)
  assert.match(source, /await appendComposerImage\(result\.dataUrl\)/)
})

test('test account starts with zero posts and retains new posts after signing back in', async () => {
  globalThis.window = { localStorage: createLocalStorage() }
  const store = await import('../src/services/paliroLocalStore.js?empty-test-account')
  const userID = store.paliroLogin('paliro@gmail.com', '67896789').session.userID
  assert.equal(store.paliroGetSocialSummary(userID).posts, 0)
  assert.deepEqual(store.paliroGetSocialState(userID).posts, [])
  const post = store.paliroCreateBoxPost(userID, { title: 'My own post', images: ['data:image/jpeg;base64,cGhvdG8='] })
  store.paliroSignOut()
  store.paliroLogin('paliro@gmail.com', '67896789')
  assert.equal(store.paliroGetSocialSummary(userID).posts, 1)
  assert.deepEqual(store.paliroGetSocialState(userID).posts, [post])
})

test('existing test accounts lose only legacy demo posts, preserving content and relationship state', async () => {
  globalThis.window = { localStorage: createLocalStorage() }
  const store = await import('../src/services/paliroLocalStore.js?legacy-demo-post-cleanup')
  const userID = 'paliro-test-user'
  const post = store.paliroCreateBoxPost(userID, { title: 'Keep my photo', images: ['data:image/jpeg;base64,cGhvdG8='] })
  const saved = JSON.parse(window.localStorage.getItem('paliro.socialState'))
  saved[userID].followers = []
  saved[userID].following = []
  saved[userID].posts.push({ id: 'paliro-demo-box-quiet-moments' }, { id: 'paliro-demo-box-creative-sparks' })
  saved['another-account'] = { posts: [{ id: 'paliro-demo-box-quiet-moments' }] }
  window.localStorage.setItem('paliro.socialState', JSON.stringify(saved))
  window.localStorage.setItem('paliro.videoState', JSON.stringify({ [userID]: { published: [{ id: 'my-video', language: 'en', baseComments: [] }], interactions: {} } }))
  const videosBefore = window.localStorage.getItem('paliro.videoState')
  for (let read = 0; read < 2; read++) {
    const state = store.paliroGetSocialState(userID)
    assert.deepEqual(state.posts, [post])
    assert.deepEqual(state.followers, [])
    assert.deepEqual(state.following, [])
  }
  const persisted = JSON.parse(window.localStorage.getItem('paliro.socialState'))
  assert.deepEqual(persisted[userID].posts, [post])
  assert.deepEqual(persisted['another-account'], saved['another-account'])
  assert.equal(window.localStorage.getItem('paliro.videoState'), videosBefore)
})
