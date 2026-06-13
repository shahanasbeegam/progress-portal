import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// GET /api/classes
router.get('/classes', async (req, res) => {
  try {
    const { data, error } = await supabase.from('classes').select('id, name, grade, section').order('name')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/students?class_id=
router.get('/students', async (req, res) => {
  try {
    const { class_id } = req.query
    let query = supabase.from('students').select('id, full_name, roll_number, class_id').order('full_name')
    if (class_id) query = query.eq('class_id', class_id)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/subjects?class_id=
router.get('/subjects', async (req, res) => {
  try {
    const { class_id } = req.query
    let query = supabase.from('subjects').select('id, name, class_id, teacher_id').order('name')
    if (class_id) query = query.eq('class_id', class_id)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/marks?student_id=
router.get('/marks', async (req, res) => {
  try {
    const { student_id } = req.query
    let query = supabase
      .from('marks')
      .select('*, subjects(name)')
      .order('entered_at', { ascending: false })
    if (student_id) query = query.eq('student_id', student_id)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/marks  — bulk upsert
router.post('/marks', async (req, res) => {
  try {
    const { marks } = req.body   // array of { student_id, subject_id, exam_type, score, max_score }
    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: 'marks array is required' })
    }
    const rows = marks.map((m) => ({ ...m, entered_by: req.user.id }))
    const { data, error } = await supabase.from('marks').insert(rows).select()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/parent/child — returns the student linked to the logged-in parent
router.get('/parent/child', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .eq('parent_profile_id', req.user.id)
      .maybeSingle()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
