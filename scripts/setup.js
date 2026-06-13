import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.setup' })

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ACCESS_TOKEN) {
  console.error('\n❌  Missing env vars. Copy .env.setup.example → .env.setup and fill in values.\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const MIGRATIONS = [
  '../supabase/migrations/001_initial_schema.sql',
  '../supabase/migrations/002_summary_unique_constraint.sql',
  '../supabase/migrations/003_fix_profiles_rls_recursion.sql',
  '../supabase/migrations/004_parent_id_progress_cards.sql',
]

async function runSQL(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const json = await res.json()
  if (!res.ok || json.error) {
    const msg = json.error ?? json.message ?? JSON.stringify(json)
    // Ignore "already exists" errors so script is idempotent
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      console.log(`  ⚠  ${label} — already exists, skipping`)
      return
    }
    throw new Error(msg)
  }
  console.log(`  ✓  ${label}`)
}

async function createBucket() {
  const { error } = await supabase.storage.createBucket('voice-notes', { public: false })
  if (error && !error.message.includes('already exists')) throw error
  console.log(`  ${error ? '⚠  voice-notes bucket already exists' : '✓  voice-notes storage bucket created'}`)
}

async function disableEmailConfirmation() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mailer_autoconfirm: true }),
  })
  if (res.ok) console.log('  ✓  Email confirmation disabled (auto-confirm on)')
  else console.log('  ⚠  Could not auto-disable email confirmation — do it manually in Supabase Auth settings')
}

async function main() {
  console.log('\n🚀  Parent-Teacher Portal — Automated Setup\n')
  console.log('📦  Step 1: Running database migrations...')

  for (const file of MIGRATIONS) {
    const path = join(__dirname, file)
    const sql = readFileSync(path, 'utf8')
    const label = file.split('/').pop()
    try {
      await runSQL(sql, label)
    } catch (err) {
      console.error(`  ❌  ${label} failed: ${err.message}`)
      process.exit(1)
    }
  }

  console.log('\n🗄️   Step 2: Creating Supabase Storage bucket...')
  try {
    await createBucket()
  } catch (err) {
    console.error(`  ❌  Storage bucket failed: ${err.message}`)
  }

  console.log('\n🔐  Step 3: Auth settings...')
  await disableEmailConfirmation()

  console.log('\n✅  Setup complete!\n')
  console.log('Next steps:')
  console.log('  1. Run:  node seed.js   ← creates admin, teacher, parent, student + sample data')
  console.log('  2. Set Vercel env vars (see instructions)')
  console.log('  3. Redeploy on Vercel\n')
}

main().catch((err) => { console.error('\n❌ ', err.message); process.exit(1) })
