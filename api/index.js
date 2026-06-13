import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import express from 'express'

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

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('API running on http://localhost:3001'))
}

export default app
