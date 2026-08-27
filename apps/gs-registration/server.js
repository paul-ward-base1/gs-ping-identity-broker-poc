import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createSessionRevocationRouter } from './session-revocation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT ?? 3300
const app = express()
app.use(createSessionRevocationRouter())

const distDir = path.join(__dirname, 'dist')
app.use(express.static(distDir))
app.use((req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`gs-registration listening on http://localhost:${PORT}`)
})
