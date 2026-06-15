import { Router } from 'express'
import { supabase } from '../_lib/supabase.js'
import {
  generateFeedbackSuggestions,
  generateAtRiskExplanation,
  generateTermSummary,
  generateParentPlainSummary,
  generateStudySuggestions,
  checkMessageTone,
} from '../_lib/anthropic.js'

const router = Router()

// POST /api/feedback-suggestions
// Body: { subject, score, max_score, class_level }
router.post('/feedback-suggestions', async (req, res) => {
  try {
    const { subject, score, max_score, class_level } = req.body
    if (!subject || score === undefined || !max_score) {
      return res.status(400).json({ error: 'subject, score, max_score required' })
    }
    const pct = (parseFloat(score) / parseFloat(max_score)) * 100
    if (pct >= 65) return res.json({ suggestions: [] })
    const suggestions = await generateFeedbackSuggestions({
      subject, score: parseFloat(score), maxScore: parseFloat(max_score), classLevel: class_level,
    })
    res.json({ suggestions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/at-risk?class_id=
router.get('/at-risk', async (req, res) => {
  try {
    const { class_id } = req.query
    if (!class_id) return res.status(400).json({ error: 'class_id required' })

    const { data: students } = await supabase
      .from('students').select('id, full_name, roll_number').eq('class_id', class_id)
    if (!students?.length) return res.json([])

    const studentIds = students.map(s => s.id)
    const { data: allMarks } = await supabase
      .from('marks')
      .select('student_id, score, max_score, subjects(name), entered_at')
      .in('student_id', studentIds)

    const results = []
    for (const student of students) {
      const marks = (allMarks || []).filter(m => m.student_id === student.id)
      if (!marks.length) continue

      const pcts = marks.map(m => m.max_score > 0 ? (m.score / m.max_score) * 100 : 0)
      const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length

      // Group marks by subject, detect declining subjects
      const bySubject = {}
      marks.forEach(m => {
        const sn = m.subjects?.name ?? 'Unknown'
        if (!bySubject[sn]) bySubject[sn] = []
        bySubject[sn].push({ pct: m.max_score > 0 ? (m.score / m.max_score) * 100 : 0, date: m.entered_at })
      })

      const signals = []
      if (avg < 50) signals.push(`Overall average is ${Math.round(avg)}%, which is below 50%`)

      Object.entries(bySubject).forEach(([subj, entries]) => {
        const subjAvg = entries.reduce((a, e) => a + e.pct, 0) / entries.length
        if (subjAvg < 50) signals.push(`${subj} average is ${Math.round(subjAvg)}%`)
        if (entries.length >= 2) {
          const sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date))
          const first = sorted.slice(0, Math.ceil(sorted.length / 2))
          const last = sorted.slice(Math.floor(sorted.length / 2))
          const firstAvg = first.reduce((a, e) => a + e.pct, 0) / first.length
          const lastAvg = last.reduce((a, e) => a + e.pct, 0) / last.length
          if (firstAvg - lastAvg > 10) signals.push(`${subj} has declined by ${Math.round(firstAvg - lastAvg)} points recently`)
        }
      })

      if (!signals.length) continue

      const severity = avg < 50 || signals.length >= 3 ? 'at_risk' : 'monitor'
      let explanation = ''
      try {
        explanation = await generateAtRiskExplanation(signals)
      } catch {
        explanation = signals.join('. ')
      }

      results.push({ student_id: student.id, full_name: student.full_name, roll_number: student.roll_number, severity, signals, explanation, avg: Math.round(avg) })
    }

    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/term-summary
router.post('/admin/term-summary', async (req, res) => {
  try {
    const { data: profiles } = await supabase.from('profiles').select('role')
    const { data: marks } = await supabase.from('marks').select('score, max_score, subjects(name), students(class_id)')
    const { data: summaries } = await supabase.from('ai_summaries').select('approved')

    const roleCounts = (profiles || []).reduce((acc, p) => { acc[p.role] = (acc[p.role] ?? 0) + 1; return acc }, {})
    const pcts = (marks || []).map(m => m.max_score > 0 ? (m.score / m.max_score) * 100 : 0)
    const avgGrade = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0

    const bySubject = {}
    ;(marks || []).forEach(m => {
      const sn = m.subjects?.name ?? 'Unknown'
      if (!bySubject[sn]) bySubject[sn] = []
      if (m.max_score > 0) bySubject[sn].push((m.score / m.max_score) * 100)
    })
    const subjectAvgs = Object.entries(bySubject).map(([name, pcts]) => ({
      name, avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
    })).sort((a, b) => b.avg - a.avg)

    const atRiskCount = pcts.filter(p => p < 50).length

    const schoolData = {
      totalTeachers: roleCounts.teacher ?? 0,
      totalStudents: roleCounts.student ?? 0,
      totalParents: roleCounts.parent ?? 0,
      averageGradePercent: avgGrade,
      strongestSubjects: subjectAvgs.slice(0, 3).map(s => `${s.name} (${s.avg}%)`),
      weakestSubjects: subjectAvgs.slice(-3).reverse().map(s => `${s.name} (${s.avg}%)`),
      studentsWithLowGrades: atRiskCount,
      summariesApproved: (summaries || []).filter(s => s.approved).length,
      totalSummariesGenerated: (summaries || []).length,
    }

    const text = await generateTermSummary(schoolData)
    res.json({ summary: text, generatedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/parent/plain-summary?student_id=
router.get('/parent/plain-summary', async (req, res) => {
  try {
    const { student_id } = req.query
    if (!student_id) return res.status(400).json({ error: 'student_id required' })

    const { data: marks } = await supabase
      .from('marks')
      .select('score, max_score, subjects(name)')
      .eq('student_id', student_id)

    if (!marks?.length) return res.json({ summary: null })

    const formatted = marks.map(m => ({ subject: m.subjects?.name ?? 'Unknown', score: m.score, max_score: m.max_score }))
    const summary = await generateParentPlainSummary(formatted)
    res.json({ summary, updatedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/parent/study-suggestions?subject=&score=&max_score=&class_level=
router.get('/parent/study-suggestions', async (req, res) => {
  try {
    const { subject, score, max_score, class_level } = req.query
    if (!subject || score === undefined || !max_score) {
      return res.status(400).json({ error: 'subject, score, max_score required' })
    }
    const pct = Math.round((parseFloat(score) / parseFloat(max_score)) * 100)
    const suggestions = await generateStudySuggestions({ subject, pct, classLevel: class_level })
    res.json({ suggestions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tone-check
// Body: { message }
router.post('/tone-check', async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.json({ ok: true })
    const result = await checkMessageTone(message)
    res.json(result)
  } catch {
    res.json({ ok: true })
  }
})

export default router
