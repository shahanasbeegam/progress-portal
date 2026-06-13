// Minimal handler - no imports - confirms latest deployment is live
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    ok: true,
    build: 'v5-zero-import',
    node: process.version,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    },
  }))
}
