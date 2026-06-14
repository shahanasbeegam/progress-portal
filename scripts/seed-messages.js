import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: new URL('.env.setup', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEACHER_MESSAGES = [
  { text: "Aryan has shown great improvement in Mathematics this quarter. Keep encouraging him at home.", sentiment: "positive" },
  { text: "Please ensure Aarav completes his homework regularly. He is missing several assignments.", sentiment: "negative" },
  { text: "Vivaan participated actively in the science project. He is doing well overall.", sentiment: "positive" },
  { text: "Kindly meet me during parent-teacher meeting. We need to discuss Vihaan's performance.", sentiment: "neutral" },
  { text: "Arjun scored excellent marks in the Q2 exam. We are very proud of his dedication.", sentiment: "positive" },
  { text: "Sai has been irregular to school lately. Please ensure punctuality.", sentiment: "negative" },
  { text: "Reyansh is a very attentive student. His class participation has improved significantly.", sentiment: "positive" },
  { text: "Please check Ayaan's diary daily for homework and notes. He needs guidance at home.", sentiment: "neutral" },
  { text: "Krishna performed below expectations in Science. Extra coaching is recommended.", sentiment: "negative" },
  { text: "Ishaan has been a role model for the class. His discipline is commendable.", sentiment: "positive" },
]

const PARENT_MESSAGES = [
  { text: "Thank you for your guidance. We will ensure he studies regularly at home.", sentiment: "positive" },
  { text: "We are concerned about the syllabus coverage. Can we schedule a meeting?", sentiment: "negative" },
  { text: "Noted, we will work on improving his attendance from this week.", sentiment: "neutral" },
  { text: "Thank you for recognising my child's efforts. We are very happy to hear this.", sentiment: "positive" },
  { text: "We are trying our best but he refuses to study. Please advise.", sentiment: "negative" },
  { text: "Can you please share the topics covered this week? We missed the class notes.", sentiment: "neutral" },
  { text: "She has been studying very hard at home. Happy to know it is showing results.", sentiment: "positive" },
  { text: "We will attend the parent teacher meeting on the scheduled date. Thank you.", sentiment: "neutral" },
  { text: "Please let us know if there are any extra classes for the annual exam preparation.", sentiment: "neutral" },
  { text: "We deeply appreciate the support you give our child. Thank you so much.", sentiment: "positive" },
]

async function main() {
  console.log('\n💬  Seeding messages (voice notes + text feedback)\n')

  // Fetch users
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  const teachers = users.filter((u) => u.user_metadata?.role === 'teacher')
  const parents = users.filter((u) => u.user_metadata?.role === 'parent')

  if (!teachers.length || !parents.length) {
    console.error('❌  No teachers or parents found. Run seed-cbse.js first.')
    process.exit(1)
  }

  // Fetch students to match parents
  const { data: students } = await supabase.from('students').select('id, parent_profile_id, class_id')

  // Map parent_profile_id → class teacher
  const { data: classes } = await supabase.from('classes').select('id, grade')
  const { data: subjects } = await supabase.from('subjects').select('id, class_id, teacher_id')

  function getTeacherForParent(parentId) {
    const student = students.find((s) => s.parent_profile_id === parentId)
    if (!student) return teachers[0]
    const sub = subjects.find((s) => s.class_id === student.class_id)
    if (!sub) return teachers[0]
    return users.find((u) => u.id === sub.teacher_id) ?? teachers[0]
  }

  let inserted = 0

  // Insert 10 teacher → parent text messages
  console.log('📩  Teacher → Parent messages...')
  for (let i = 0; i < 10; i++) {
    const teacher = teachers[i % teachers.length]
    const parent = parents[i % Math.min(parents.length, 30)]
    const msg = TEACHER_MESSAGES[i]
    const { error } = await supabase.from('voice_notes').insert({
      sender_id: teacher.id,
      recipient_id: parent.id,
      transcript: msg.text,
      sentiment: msg.sentiment,
      type: 'text',
      storage_path: null,
      duration_secs: null,
    })
    if (error) console.log(`  ⚠  ${error.message}`)
    else { console.log(`  ✓  [${msg.sentiment}] ${msg.text.slice(0, 60)}…`); inserted++ }
  }

  // Insert 10 parent → teacher text messages
  console.log('\n📩  Parent → Teacher messages...')
  for (let i = 0; i < 10; i++) {
    const parent = parents[i % Math.min(parents.length, 30)]
    const teacher = getTeacherForParent(parent.id)
    const msg = PARENT_MESSAGES[i]
    const { error } = await supabase.from('voice_notes').insert({
      sender_id: parent.id,
      recipient_id: teacher.id,
      transcript: msg.text,
      sentiment: msg.sentiment,
      type: 'text',
      storage_path: null,
      duration_secs: null,
    })
    if (error) console.log(`  ⚠  ${error.message}`)
    else { console.log(`  ✓  [${msg.sentiment}] ${msg.text.slice(0, 60)}…`); inserted++ }
  }

  console.log(`\n✅  Done — ${inserted} messages inserted.\n`)
}

main().catch((err) => { console.error('\n❌ ', err.message); process.exit(1) })
