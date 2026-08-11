import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, 'data.json')

app.use(cors())
app.use(express.json())

function getData() {
  if (!fs.existsSync(dataFile)) {
    return { users: {} }
  }

  return JSON.parse(fs.readFileSync(dataFile, 'utf8'))
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
}

app.post('/api/login', (req, res) => {
  const username = req.body.username?.trim()

  if (!username) {
    return res.status(400).json({ message: 'Username is required' })
  }

  const data = getData()

  if (!data.users[username]) {
    data.users[username] = {
      username,
      budget: '10000',
      expenses: [],
      createdAt: new Date().toISOString(),
    }

    saveData(data)
  }

  res.json(data.users[username])
})

app.get('/api/users/:username', (req, res) => {
  const data = getData()
  const user = data.users[req.params.username]

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.json(user)
})

app.put('/api/users/:username', (req, res) => {
  const data = getData()
  const username = req.params.username

  if (!data.users[username]) {
    return res.status(404).json({ message: 'User not found' })
  }

  data.users[username] = {
    ...data.users[username],
    budget: req.body.budget,
    expenses: req.body.expenses,
  }

  saveData(data)

  res.json(data.users[username])
})

app.listen(port, () => {
  console.log(`BudgetBuddy backend running on http://localhost:${port}`)
})