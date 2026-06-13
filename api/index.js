// Zero-import health check to confirm Vercel function runtime works
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    ok: true,
    node: process.version,
    url: req.url,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    },
  }))
}
