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

// Proxy so callers can still use `supabase.from(...)` etc.
export const supabase = new Proxy({}, {
  get(_, prop) {
    return (...args) => getClient()[prop](...args)
  },
})
