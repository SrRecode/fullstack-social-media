import express from 'express'

const postSchema = (value) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 500
const commentSchema = (value) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 280
const safeMessage = 'This action is not available. Refresh the page and try again.'

export function createApp(store) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '16kb' }))
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api', async (req, res, next) => {
    const userId = req.get('X-Demo-User')
    if (!userId) return res.status(401).json({ error: 'Choose a demo profile to continue.' })
    try {
      if (!await store.hasUser(userId)) return res.status(401).json({ error: 'That demo profile no longer exists.' })
      req.demoUserId = userId
      next()
    } catch (error) { next(error) }
  })

  app.get('/api/bootstrap', async (req, res, next) => {
    try {
      const result = await store.bootstrap(req.demoUserId)
      if (!result) return res.status(401).json({ error: 'That demo profile no longer exists.' })
      res.json(result)
    } catch (error) { next(error) }
  })

  app.post('/api/posts', async (req, res, next) => {
    if (!postSchema(req.body?.text)) return res.status(400).json({ error: 'Write a post between 1 and 500 characters.' })
    try { res.status(201).json(await store.createPost(req.demoUserId, req.body.text.trim())) }
    catch (error) { next(error) }
  })

  app.post('/api/posts/:postId/like', async (req, res, next) => {
    try {
      const result = await store.toggleLike(req.demoUserId, req.params.postId)
      if (!result) return res.status(404).json({ error: 'That post could not be found.' })
      res.json(result)
    } catch (error) { next(error) }
  })

  app.post('/api/posts/:postId/comments', async (req, res, next) => {
    if (!commentSchema(req.body?.text)) return res.status(400).json({ error: 'Write a reply between 1 and 280 characters.' })
    try {
      const result = await store.addComment(req.demoUserId, req.params.postId, req.body.text.trim())
      if (!result) return res.status(404).json({ error: 'That post could not be found.' })
      res.status(201).json(result)
    } catch (error) { next(error) }
  })

  app.post('/api/users/:targetId/follow', async (req, res, next) => {
    try {
      const result = await store.toggleFollow(req.demoUserId, req.params.targetId)
      if (!result) return res.status(400).json({ error: 'That profile cannot be followed.' })
      res.json(result)
    } catch (error) { next(error) }
  })

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'The request body must be valid JSON.' })
    console.error(error)
    res.status(500).json({ error: safeMessage })
  })
  return app
}
