import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import express from 'express'
import { supabase } from './lib/supabase.js'
import marksRouter from './routes/marks.js'
import summariesRouter from './routes/summaries.js'

const app = express()
app.use(express.json())

async function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7))
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  req.user = user
  next()
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/me', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()
    if (error) throw error
    res.json({ user: req.user, profile: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.use('/api', authenticate, marksRouter)
app.use('/api', authenticate, summariesRouter)

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('API running on http://localhost:3001'))
}

export default app
