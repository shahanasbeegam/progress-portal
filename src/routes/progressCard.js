import { Router } from 'express'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import crypto from 'crypto'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/progress-card/generate', async (req, res) => {
  try {
    const { student_id, term } = req.body
    if (!student_id || !term) return res.status(400).json({ error: 'student_id and term required' })

    const [{ data: student }, { data: marks }, { data: summary }] = await Promise.all([
      supabase.from('students').select('full_name, classes(name)').eq('id', student_id).single(),
      supabase.from('marks').select('score, max_score, exam_type, subjects(name)').eq('student_id', student_id),
      supabase.from('ai_summaries').select('summary_text').eq('student_id', student_id).eq('term', term).eq('approved', true).maybeSingle(),
    ])

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const blue = rgb(0.1, 0.38, 0.8)
    const white = rgb(1, 1, 1)
    const lightBlue = rgb(0.93, 0.96, 1)

    // Header
    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: blue })
    page.drawText('STUDENT PROGRESS CARD', { x: 50, y: 808, size: 18, font: bold, color: white })
    page.drawText('Parent-Teacher Portal', { x: 400, y: 808, size: 10, font, color: white })

    // Student info
    let y = 760
    page.drawText(`Student: ${student?.full_name ?? ''}`, { x: 50, y, size: 12, font: bold })
    page.drawText(`Class: ${student?.classes?.name ?? ''}`, { x: 320, y, size: 12, font })
    y -= 20
    page.drawText(`Term: ${term}`, { x: 50, y, size: 12, font })
    page.drawText(`Date: ${new Date().toLocaleDateString('en-IN')}`, { x: 320, y, size: 12, font })

    // Table header
    y -= 35
    page.drawRectangle({ x: 50, y: y - 6, width: 495, height: 22, color: blue })
    ;[['Subject', 55], ['Exam', 225], ['Score', 340], ['Max', 410], ['%', 475]].forEach(([label, x]) =>
      page.drawText(label, { x, y, size: 10, font: bold, color: white })
    )

    y -= 24
    ;(marks ?? []).forEach((m, i) => {
      const pct = m.max_score > 0 ? ((m.score / m.max_score) * 100).toFixed(1) : '—'
      if (i % 2 === 0) page.drawRectangle({ x: 50, y: y - 6, width: 495, height: 20, color: lightBlue })
      page.drawText(m.subjects?.name ?? '', { x: 55, y, size: 9, font })
      page.drawText(m.exam_type, { x: 225, y, size: 9, font })
      page.drawText(String(m.score), { x: 345, y, size: 9, font })
      page.drawText(String(m.max_score), { x: 415, y, size: 9, font })
      page.drawText(`${pct}%`, { x: 473, y, size: 9, font })
      y -= 22
    })

    // AI Summary
    if (summary?.summary_text) {
      y -= 16
      page.drawText('Progress Summary', { x: 50, y, size: 12, font: bold, color: blue })
      y -= 18
      const words = summary.summary_text.split(' ')
      let line = ''
      for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (test.length > 90) {
          page.drawText(line, { x: 50, y, size: 10, font }); y -= 15; line = word
        } else { line = test }
      }
      if (line) { page.drawText(line, { x: 50, y, size: 10, font }); y -= 15 }
    }

    // Sign
    const pdfBytes = await pdfDoc.save()
    const sig = crypto.createHmac('sha256', process.env.PDF_SIGNING_SECRET || 'pt-portal-secret')
      .update(Buffer.from(pdfBytes)).digest('hex')

    page.drawLine({ start: { x: 50, y: 70 }, end: { x: 545, y: 70 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    page.drawText(`Signature: ${sig.slice(0, 40)}...`, { x: 50, y: 55, size: 7, font, color: rgb(0.5, 0.5, 0.5) })
    page.drawText(`Generated: ${new Date().toISOString()} | Digitally signed document`, { x: 50, y: 42, size: 7, font, color: rgb(0.5, 0.5, 0.5) })

    const finalBytes = await pdfDoc.save()

    await supabase.from('progress_cards').upsert(
      { student_id, term, signature: sig, generated_by: req.user.id },
      { onConflict: 'student_id,term' }
    )

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="progress-card-${term}.pdf"` })
    res.send(Buffer.from(finalBytes))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
