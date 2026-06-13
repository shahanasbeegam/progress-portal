import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;padding:2rem;color:#b91c1c;background:#fef2f2;min-height:100vh">
      <h2>Configuration Error</h2>
      <p>Missing environment variables: <code>VITE_SUPABASE_URL</code> and/or <code>VITE_SUPABASE_PUBLISHABLE_KEY</code></p>
      <p>Add them in Vercel → Project → Settings → Environment Variables, then redeploy.</p>
    </div>`
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
