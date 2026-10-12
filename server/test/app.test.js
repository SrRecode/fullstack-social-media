import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach } from 'node:test'
import { createApp } from '../src/app.js'
import { createStore } from '../src/store.js'

const directories = []
async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'circles-test-'))
  directories.push(directory)
  const app = createApp(createStore(join(directory, 'social.json')))
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  return { base: `http://127.0.0.1:${server.address().port}`, server }
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

test('requires an explicit demo identity and returns seeded community data', async (context) => {
  const { base, server } = await setup()
  context.after(() => server.close())
  assert.equal((await fetch(`${base}/api/bootstrap`)).status, 401)
  const response = await fetch(`${base}/api/bootstrap`, { headers: { 'X-Demo-User': 'maya' } })
  const result = await response.json()
  assert.equal(response.status, 200)
  assert.equal(result.currentUser.name, 'Maya Chen')
  assert.equal(result.posts.length, 5)
})

test('validates and persists a created post', async (context) => {
  const { base, server } = await setup()
  context.after(() => server.close())
  const headers = { 'Content-Type': 'application/json', 'X-Demo-User': 'maya' }
  assert.equal((await fetch(`${base}/api/posts`, { method: 'POST', headers, body: JSON.stringify({ text: '   ' }) })).status, 400)
  const created = await fetch(`${base}/api/posts`, { method: 'POST', headers, body: JSON.stringify({ text: ' A small good thing ' }) })
  assert.equal(created.status, 201)
  assert.equal((await created.json()).text, 'A small good thing')
  const state = JSON.parse(await readFile(join(directories.at(-1), 'social.json'), 'utf8'))
  assert.equal(state.posts[0].text, 'A small good thing')
})

test('toggles reactions, comments, and follows', async (context) => {
  const { base, server } = await setup()
  context.after(() => server.close())
  const headers = { 'Content-Type': 'application/json', 'X-Demo-User': 'maya' }
  const unlike = await fetch(`${base}/api/posts/post-4/like`, { method: 'POST', headers })
  assert.equal((await unlike.json()).liked, false)
  const like = await fetch(`${base}/api/posts/post-4/like`, { method: 'POST', headers })
  assert.equal((await like.json()).liked, true)
  const comment = await fetch(`${base}/api/posts/post-4/comments`, { method: 'POST', headers, body: JSON.stringify({ text: 'Lovely!' }) })
  assert.equal((await comment.json()).comments.at(-1).text, 'Lovely!')
  const follow = await fetch(`${base}/api/users/jules/follow`, { method: 'POST', headers })
  assert.equal((await follow.json()).following, true)
})

test('rejects unknown profiles and missing posts', async (context) => {
  const { base, server } = await setup()
  context.after(() => server.close())
  const headers = { 'Content-Type': 'application/json', 'X-Demo-User': 'nobody' }
  assert.equal((await fetch(`${base}/api/bootstrap`, { headers })).status, 401)
  const validIdentity = { 'X-Demo-User': 'maya' }
  assert.equal((await fetch(`${base}/api/posts/missing/like`, { method: 'POST', headers: validIdentity })).status, 404)
  assert.equal((await fetch(`${base}/api/posts`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Hello' }) })).status, 401)
})
