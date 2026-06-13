import express from 'express'
import marksRouter from '../src/routes/marks.js'
import summariesRouter from '../src/routes/summaries.js'
import progressCardRouter from '../src/routes/progressCard.js'
import voiceNotesRouter from '../src/routes/voiceNotes.js'

const app = express()
app.use(express.json())

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

app.use('/api', marksRouter)
app.use('/api', summariesRouter)
app.use('/api', progressCardRouter)
app.use('/api', voiceNotesRouter)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('API running on http://localhost:3001'))
}

export default app
