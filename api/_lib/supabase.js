import { createClient } from '@supabase/supabase-js'

let _client = null

function getClient() {
  if (!_client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(`Missing env vars: SUPABASE_URL=${url ? 'ok' : 'MISSING'}, SUPABASE_SERVICE_ROLE_KEY=${key ? 'ok' : 'MISSING'}`)
    }
    _client = createClient(url, key)
  }
  return _client
}

// Proxy that handles both methods (.from, .rpc) and properties (.storage, .auth)
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getClient()
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
