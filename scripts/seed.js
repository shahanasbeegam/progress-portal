import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: new URL('.env.setup', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.setup\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createUser(email, password, fullName, role) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)
  if (found) {
    console.log(`  ⚠  ${role} (${email}) already exists`)
    // Ensure profile exists with correct role
    await supabase.from('profiles').upsert({ id: found.id, full_name: fullName, role }, { onConflict: 'id' })
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`Create ${role}: ${error.message}`)

  // Upsert profile (trigger may have already created it)
  await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, role }, { onConflict: 'id' })
  console.log(`  ✓  ${role}: ${email} / ${password}`)
  return data.user.id
}

async function main() {
  console.log('\n🌱  Parent-Teacher Portal — Seed Sample Data\n')

  // 1. Users
  console.log('👤  Creating users...')
  const adminId    = await createUser('admin@school.com',   'Admin@1234',   'Admin',          'admin')
  const teacherId  = await createUser('teacher@school.com', 'Teacher@1234', 'Mrs. Priya S.',  'teacher')
  const parentId   = await createUser('parent@school.com',  'Parent@1234',  'Mr. Rahul K.',   'parent')
  await createUser('student@school.com', 'Student@1234', 'Aryan Rahul', 'student')

  // 2. Class
  console.log('\n🏫  Creating class...')
  let { data: cls } = await supabase.from('classes').select('id').eq('name', 'Class 10A').maybeSingle()
  if (!cls) {
    const { data, error } = await supabase.from('classes').insert({ name: 'Class 10A', grade: '10', section: 'A' }).select().single()
    if (error) throw error
    cls = data
    console.log('  ✓  Class 10A created')
  } else {
    console.log('  ⚠  Class 10A already exists')
  }

  // 3. Subjects
  console.log('\n📚  Creating subjects...')
  const subjectNames = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science']
  const subjectIds = {}
  for (const name of subjectNames) {
    let { data: sub } = await supabase.from('subjects').select('id').eq('name', name).eq('class_id', cls.id).maybeSingle()
    if (!sub) {
      const { data, error } = await supabase.from('subjects').insert({ name, class_id: cls.id, teacher_id: teacherId }).select().single()
      if (error) throw error
      sub = data
      console.log(`  ✓  Subject: ${name}`)
    } else {
      console.log(`  ⚠  Subject ${name} already exists`)
    }
    subjectIds[name] = sub.id
  }

  // 4. Student record
  console.log('\n🎓  Creating student record...')
  let { data: student } = await supabase.from('students').select('id').eq('full_name', 'Aryan Rahul').maybeSingle()
  if (!student) {
    const { data, error } = await supabase.from('students').insert({
      full_name: 'Aryan Rahul', roll_number: 'R001',
      class_id: cls.id, parent_profile_id: parentId,
    }).select().single()
    if (error) throw error
    student = data
    console.log('  ✓  Student: Aryan Rahul (linked to parent)')
  } else {
    // Update parent link in case it's missing
    await supabase.from('students').update({ class_id: cls.id, parent_profile_id: parentId }).eq('id', student.id)
    console.log('  ⚠  Student already exists — updated class + parent link')
  }

  // 5. Sample marks
  console.log('\n📝  Inserting sample marks...')
  const sampleMarks = [
    { subject: 'Mathematics',       exam_type: 'midterm', score: 82, max_score: 100 },
    { subject: 'Science',           exam_type: 'midterm', score: 76, max_score: 100 },
    { subject: 'English',           exam_type: 'midterm', score: 90, max_score: 100 },
    { subject: 'Social Studies',    exam_type: 'midterm', score: 68, max_score: 100 },
    { subject: 'Computer Science',  exam_type: 'midterm', score: 95, max_score: 100 },
    { subject: 'Mathematics',       exam_type: 'unit_test', score: 35, max_score: 50 },
    { subject: 'Science',           exam_type: 'unit_test', score: 40, max_score: 50 },
    { subject: 'English',           exam_type: 'unit_test', score: 45, max_score: 50 },
  ]

  for (const m of sampleMarks) {
    if (!subjectIds[m.subject]) continue
    const { error } = await supabase.from('marks').insert({
      student_id: student.id, subject_id: subjectIds[m.subject],
      exam_type: m.exam_type, score: m.score, max_score: m.max_score, entered_by: teacherId,
    })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠  Mark insert (${m.subject}/${m.exam_type}): ${error.message}`)
    } else if (!error) {
      console.log(`  ✓  ${m.subject} ${m.exam_type}: ${m.score}/${m.max_score}`)
    }
  }

  console.log('\n✅  Seeding complete!\n')
  console.log('Login credentials:')
  console.log('  Admin:    admin@school.com   /  Admin@1234')
  console.log('  Teacher:  teacher@school.com /  Teacher@1234')
  console.log('  Parent:   parent@school.com  /  Parent@1234')
  console.log('  Student:  student@school.com /  Student@1234\n')
  console.log('As teacher: go to Mark Entry → enter marks → Generate AI Summary → approve it')
  console.log('As parent:  go to Progress Report / Charts / Download PDF\n')
}

main().catch((err) => { console.error('\n❌ ', err.message); process.exit(1) })
