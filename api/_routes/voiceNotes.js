import { Router } from 'express'
import { supabase } from '../_lib/supabase.js'
import { anthropic } from '../_lib/anthropic.js'

const router = Router()

// GET /api/voice-notes
router.get('/voice-notes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('*, sender:sender_id(full_name, role), recipient:recipient_id(full_name)')
      .or(`sender_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/voice-notes — create record after frontend uploads to storage
router.post('/voice-notes', async (req, res) => {
  try {
    const { storage_path, recipient_id, class_id, duration_secs, transcript } = req.body
    if (!storage_path) return res.status(400).json({ error: 'storage_path required' })

    const { data, error } = await supabase.from('voice_notes').insert({
      sender_id: req.user.id, recipient_id, class_id, storage_path, duration_secs, transcript,
    }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/voice-notes/:id/transcribe — Claude sentiment on existing transcript
router.post('/voice-notes/:id/transcribe', async (req, res) => {
  try {
    const { id } = req.params
    const { data: note, error: nErr } = await supabase
      .from('voice_notes').select('transcript').eq('id', id).single()
    if (nErr) throw nErr

    const transcript = note.transcript
    if (!transcript) return res.status(400).json({ error: 'No transcript available for this note' })

    // Sentiment with Claude
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 20,
      messages: [{ role: 'user', content: `Classify the sentiment of this message as exactly one word: positive, negative, or neutral.\n\n"${transcript}"` }],
    })
    const sentiment = msg.content[0].text.trim().toLowerCase().replace(/[^a-z]/g, '')

    const { data, error } = await supabase
      .from('voice_notes').update({ sentiment }).eq('id', id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/voice-notes/signed-url/:id — signed URL for playback
router.get('/voice-notes/signed-url/:id', async (req, res) => {
  try {
    const { data: note, error } = await supabase.from('voice_notes').select('storage_path').eq('id', req.params.id).single()
    if (error) throw error
    const { data, error: sErr } = await supabase.storage.from('voice-notes').createSignedUrl(note.storage_path, 3600)
    if (sErr) throw sErr
    res.json({ url: data.signedUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sentiment — aggregate sentiment for teacher dashboard
router.get('/sentiment', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('sentiment, created_at, transcript, recipient:recipient_id(full_name)')
      .eq('recipient_id', req.user.id)
      .not('sentiment', 'is', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
