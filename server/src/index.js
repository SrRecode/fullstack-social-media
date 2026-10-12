import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createApp } from './app.js'
import { createStore } from './store.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const filePath = process.env.DATABASE_PATH
  ? resolve(process.cwd(), process.env.DATABASE_PATH)
  : resolve(root, 'data', 'social.json')
const port = Number(process.env.PORT || 4000)
const host = process.env.HOST || '127.0.0.1'
const app = createApp(createStore(filePath))

app.listen(port, host, () => {
  console.log(`Circles API listening at http://${host}:${port}`)
})
