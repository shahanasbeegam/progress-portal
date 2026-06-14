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

const COMMON_PASSWORD = 'School@1234'

// Indian CBSE student first names and last names
const FIRST_NAMES = [
  'Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan',
  'Shaurya','Atharv','Advik','Pranav','Advait','Dhruv','Kabir','Ritvik','Aarush','Darsh',
  'Ananya','Pari','Anika','Riya','Aadhya','Saanvi','Myra','Priya','Kavya','Ishita',
  'Diya','Aisha','Trisha','Sneha','Pooja','Nandini','Shruti','Meera','Lakshmi','Divya',
  'Rohan','Karan','Varun','Nikhil','Rahul','Amit','Vijay','Suresh','Ramesh','Ganesh',
  'Tanvi','Swati','Neha','Khushi','Anjali','Simran','Komal','Nisha','Radha','Sunita',
  'Aman','Yash','Harsh','Dev','Rajan','Sanjay','Vinay','Ajay','Mohan','Pavan',
  'Deepa','Usha','Rekha','Geeta','Savita','Shobha','Lata','Suman','Mala','Pushpa',
  'Akshay','Suraj','Nitin','Sachin','Vikram','Rohit','Gaurav','Vishal','Manish','Rajesh',
]

const LAST_NAMES = [
  'Sharma','Verma','Singh','Kumar','Gupta','Patel','Shah','Mehta','Joshi','Pandey',
  'Yadav','Mishra','Tiwari','Srivastava','Chauhan','Agarwal','Reddy','Nair','Pillai','Menon',
  'Iyer','Rao','Desai','Bhatt','Kapoor','Malhotra','Saxena','Bose','Das','Chatterjee',
]

function randomScore(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function studentName(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[index % LAST_NAMES.length]
  return `${first} ${last}`
}

function parentName(studentFullName) {
  const last = studentFullName.split(' ')[1]
  const prefixes = ['Mr.', 'Mrs.', 'Dr.']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const firstNames = ['Rajesh','Sunita','Suresh','Priya','Ramesh','Anita','Vijay','Geeta','Anil','Kavita']
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  return `${prefix} ${first} ${last}`
}

async function createUser(email, password, fullName, role) {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const found = existing?.users?.find((u) => u.email === email)
  if (found) {
    await supabase.from('profiles').upsert({ id: found.id, full_name: fullName, role }, { onConflict: 'id' })
    return found.id
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`Create ${role} (${email}): ${error.message}`)
  await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, role }, { onConflict: 'id' })
  return data.user.id
}

async function main() {
  console.log('\n🌱  CBSE School — Full Seed Data\n')

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  console.log('👤  Creating admin...')
  await createUser('admin@school.com', COMMON_PASSWORD, 'Admin', 'admin')
  console.log('  ✓  admin@school.com / School@1234')

  // ── 2. Teachers (one per class, identified by code) ───────────────────────
  console.log('\n👨‍🏫  Creating teachers...')
  const teachers = [
    { email: 'teacher801@school.com', name: 'Mrs. Sunita Sharma',  code: 'T801', grade: '8' },
    { email: 'teacher901@school.com', name: 'Mr. Rajesh Verma',    code: 'T901', grade: '9' },
    { email: 'teacher1001@school.com', name: 'Mrs. Priya Menon',   code: 'T1001', grade: '10' },
  ]
  const teacherIds = {}
  for (const t of teachers) {
    const id = await createUser(t.email, COMMON_PASSWORD, `${t.name} (${t.code})`, 'teacher')
    teacherIds[t.grade] = id
    console.log(`  ✓  ${t.code}: ${t.email} / ${COMMON_PASSWORD}`)
  }

  // ── 3. Classes ────────────────────────────────────────────────────────────
  console.log('\n🏫  Creating classes...')
  const classGrades = ['8', '9', '10']
  const classIds = {}
  for (const grade of classGrades) {
    const name = `Class ${grade}A`
    let { data: cls } = await supabase.from('classes').select('id').eq('name', name).maybeSingle()
    if (!cls) {
      const { data, error } = await supabase.from('classes').insert({ name, grade, section: 'A' }).select().single()
      if (error) throw error
      cls = data
      console.log(`  ✓  ${name}`)
    } else {
      console.log(`  ⚠  ${name} already exists`)
    }
    classIds[grade] = cls.id
  }

  // ── 4. Subjects (5 per class, CBSE) ──────────────────────────────────────
  console.log('\n📚  Creating subjects...')
  const CBSE_SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi']
  const subjectIds = {} // subjectIds[grade][subjectName] = id
  for (const grade of classGrades) {
    subjectIds[grade] = {}
    for (const name of CBSE_SUBJECTS) {
      let { data: sub } = await supabase.from('subjects').select('id').eq('name', name).eq('class_id', classIds[grade]).maybeSingle()
      if (!sub) {
        const { data, error } = await supabase.from('subjects')
          .insert({ name, class_id: classIds[grade], teacher_id: teacherIds[grade] }).select().single()
        if (error) throw error
        sub = data
      }
      subjectIds[grade][name] = sub.id
    }
    console.log(`  ✓  5 subjects for Class ${grade}A`)
  }

  // ── 5. Students + Parents (30 per class) ─────────────────────────────────
  console.log('\n🎓  Creating students and parents (90 each)...')
  const EXAMS = [
    { type: 'Q1', label: 'Quarter 1', max: 100 },
    { type: 'Q2', label: 'Quarter 2', max: 100 },
    { type: 'Annual', label: 'Annual Exam', max: 100 },
  ]

  let studentIndex = 0
  for (const grade of classGrades) {
    console.log(`\n  Class ${grade}A:`)
    for (let i = 1; i <= 30; i++) {
      const rollNum = `${grade}${String(i).padStart(2, '0')}`
      const sName = studentName(studentIndex)
      const pName = parentName(sName)
      const pEmail = `parent${grade}${String(i).padStart(2, '0')}@school.com`
      const sEmail = `student${grade}${String(i).padStart(2, '0')}@school.com`

      // Create parent
      const parentId = await createUser(pEmail, COMMON_PASSWORD, pName, 'parent')

      // Create student auth user
      const studentId = await createUser(sEmail, COMMON_PASSWORD, sName, 'student')

      // Create student record
      let { data: student } = await supabase.from('students').select('id')
        .eq('roll_number', rollNum).eq('class_id', classIds[grade]).maybeSingle()
      if (!student) {
        const { data, error } = await supabase.from('students').insert({
          full_name: sName, roll_number: rollNum,
          class_id: classIds[grade], parent_profile_id: parentId,
        }).select().single()
        if (error) throw error
        student = data
      } else {
        await supabase.from('students').update({ parent_profile_id: parentId }).eq('id', student.id)
      }

      // Insert marks for all 5 subjects × 3 exams
      const marksToInsert = []
      for (const subName of CBSE_SUBJECTS) {
        for (const exam of EXAMS) {
          const score = randomScore(40, exam.max)
          marksToInsert.push({
            student_id: student.id,
            subject_id: subjectIds[grade][subName],
            exam_type: exam.type,
            score,
            max_score: exam.max,
            entered_by: teacherIds[grade],
          })
        }
      }
      // Check if marks already exist before inserting
      const { data: existingMarks } = await supabase.from('marks')
        .select('id').eq('student_id', student.id).limit(1)
      if (!existingMarks || existingMarks.length === 0) {
        const { error } = await supabase.from('marks').insert(marksToInsert)
        if (error) console.log(`    ⚠  Marks for ${sName}: ${error.message}`)
      }

      process.stdout.write(`    ✓  [${rollNum}] ${sName}\n`)
      studentIndex++
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅  CBSE Seed Complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('LOGIN CREDENTIALS (password for all: School@1234)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:       admin@school.com')
  console.log('Teacher 8A:  teacher801@school.com   (Code: T801)')
  console.log('Teacher 9A:  teacher901@school.com   (Code: T901)')
  console.log('Teacher 10A: teacher1001@school.com  (Code: T1001)')
  console.log('Parents:     parent801@school.com … parent1030@school.com')
  console.log('Students:    student801@school.com … student1030@school.com')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch((err) => { console.error('\n❌ ', err.message); process.exit(1) })
