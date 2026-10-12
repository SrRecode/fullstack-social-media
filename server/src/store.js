import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { seedData } from './data.js'

export function createStore(filePath) {
  let data
  let queue = Promise.resolve()

  async function load() {
    if (data) return data
    try {
      data = JSON.parse(await readFile(filePath, 'utf8'))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      data = structuredClone(seedData)
    }
    return data
  }

  async function persist() {
    await mkdir(dirname(filePath), { recursive: true })
    const temporaryPath = `${filePath}.${process.pid}.tmp`
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), 'utf8')
    const { rename } = await import('node:fs/promises')
    await rename(temporaryPath, filePath)
  }

  async function update(operation) {
    const result = queue.then(async () => {
      await load()
      const value = operation(data)
      await persist()
      return value
    })
    queue = result.catch(() => {})
    return result
  }

  return {
    async hasUser(userId) {
      const state = await load()
      return state.users.some((user) => user.id === userId)
    },
    async bootstrap(userId) {
      const state = await load()
      const currentUser = state.users.find((user) => user.id === userId)
      if (!currentUser) return null
      return structuredClone({ currentUser, users: state.users, posts: state.posts })
    },
    async createPost(userId, text) {
      return update((state) => {
        const post = { id: randomUUID(), userId, text, createdAt: new Date().toISOString(), likes: [], comments: [] }
        state.posts.unshift(post)
        return structuredClone(post)
      })
    },
    async toggleLike(userId, postId) {
      return update((state) => {
        const post = state.posts.find((item) => item.id === postId)
        if (!post) return null
        const index = post.likes.indexOf(userId)
        if (index === -1) post.likes.push(userId)
        else post.likes.splice(index, 1)
        return { liked: index === -1, likes: [...post.likes] }
      })
    },
    async addComment(userId, postId, text) {
      return update((state) => {
        const post = state.posts.find((item) => item.id === postId)
        if (!post) return null
        post.comments.push({ id: randomUUID(), userId, text, createdAt: new Date().toISOString() })
        return structuredClone(post)
      })
    },
    async toggleFollow(userId, targetId) {
      return update((state) => {
        const user = state.users.find((item) => item.id === userId)
        if (!user || userId === targetId || !state.users.some((item) => item.id === targetId)) return null
        const index = user.following.indexOf(targetId)
        if (index === -1) user.following.push(targetId)
        else user.following.splice(index, 1)
        return { following: index === -1 }
      })
    },
  }
}
