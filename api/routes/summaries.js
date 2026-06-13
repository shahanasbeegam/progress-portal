import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { generateProgressSummary } from '../lib/anthropic.js'

const router = Router()

// GET /api/summaries?approved=false
router.get('/summaries', async (req, res) => {
  try {
    const { approved } = req.query
    let query = supabase
      .from('ai_summaries')
      .select('*, students(full_name, class_id, classes(name))')
      .order('created_at', { ascending: false })
    if (approved !== undefined) query = query.eq('approved', approved === 'true')
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/summaries/generate
router.post('/summaries/generate', async (req, res) => {
  try {
    const { student_id, term } = req.body
    if (!student_id || !term) return res.status(400).json({ error: 'student_id and term required' })

    // Fetch student + class info
    const { data: student, error: sErr } = await supabase
      .from('students')
      .select('full_name, class_id, classes(name)')
      .eq('id', student_id)
      .single()
    if (sErr) throw sErr

    // Fetch marks for this student
    const { data: marks, error: mErr } = await supabase
      .from('marks')
      .select('score, max_score, exam_type, subjects(name)')
      .eq('student_id', student_id)
    if (mErr) throw mErr

    if (!marks.length) return res.status(400).json({ error: 'No marks found for this student' })

    const formattedMarks = marks.map((m) => ({
      subject: m.subjects?.name ?? 'Unknown',
      score: m.score,
      max_score: m.max_score,
      exam_type: m.exam_type,
    }))

    const summaryText = await generateProgressSummary({
      studentName: student.full_name,
      className: student.classes?.name ?? '',
      term,
      marks: formattedMarks,
    })

    // Save to DB (upsert by student + term)
    const { data: saved, error: iErr } = await supabase
      .from('ai_summaries')
      .upsert(
        { student_id, term, summary_text: summaryText, approved: false },
        { onConflict: 'student_id,term' },
      )
      .select()
      .single()
    if (iErr) throw iErr

    res.json(saved)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/summaries/:id/approve
router.put('/summaries/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('ai_summaries')
      .update({ approved: true, approved_by: req.user.id })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/summaries/:id  — edit summary text before approving
router.put('/summaries/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { summary_text } = req.body
    const { data, error } = await supabase
      .from('ai_summaries')
      .update({ summary_text })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
