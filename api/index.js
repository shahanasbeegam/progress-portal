import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Verify JWT from Supabase and attach user to req
async function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  req.user = user
  next()
}

// Fetch the profile role for the authenticated user
async function withProfile(req, res, next) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', req.user.id)
    .single()
  if (error) return res.status(500).json({ error: 'Failed to load profile' })
  req.profile = data
  next()
}

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Current user profile
app.get('/api/me', authenticate, withProfile, (req, res) => {
  res.json({ user: req.user, profile: req.profile })
})

// Marks routes (stub — will be expanded in Feature 2)
app.get('/api/marks', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('marks').select('*')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Vercel expects a default export of the Express app
export default app
