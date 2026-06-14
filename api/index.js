import express from 'express'
import { createClient } from '@supabase/supabase-js'
import marksRouter from '../src/routes/marks.js'
import summariesRouter from '../src/routes/summaries.js'
import progressCardRouter from '../src/routes/progressCard.js'
import voiceNotesRouter from '../src/routes/voiceNotes.js'

const app = express()
app.use(express.json())

// JWT auth middleware — runs before all /api protected routes
async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' })
    req.user = data.user
    next()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    node: process.version,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    },
  })
})

app.use('/api', auth, marksRouter)
app.use('/api', auth, summariesRouter)
app.use('/api', auth, progressCardRouter)
app.use('/api', auth, voiceNotesRouter)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('API running on http://localhost:3001'))
}

export default app
