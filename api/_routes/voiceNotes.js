import { Router } from 'express'
import { supabase } from '../_lib/supabase.js'
import { anthropic } from '../_lib/anthropic.js'
import { getGroq } from '../_lib/groq.js'

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

// POST /api/voice-notes/:id/transcribe — Groq Whisper transcription + Claude sentiment
router.post('/voice-notes/:id/transcribe', async (req, res) => {
  try {
    const { id } = req.params
    const { data: note, error: nErr } = await supabase
      .from('voice_notes').select('storage_path, transcript').eq('id', id).single()
    if (nErr) throw nErr

    let transcript = note.transcript

    // If no transcript yet, download audio and transcribe with Groq Whisper
    if (!transcript) {
      const { data: fileBlob, error: dErr } = await supabase.storage
        .from('voice-notes').download(note.storage_path)
      if (dErr) throw dErr

      const arrayBuffer = await fileBlob.arrayBuffer()
      const audioFile = new File([Buffer.from(arrayBuffer)], 'audio.webm', { type: 'audio/webm' })

      const groq = getGroq()
      const result = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        response_format: 'text',
      })
      transcript = typeof result === 'string' ? result : result.text
    }

    if (!transcript) return res.status(400).json({ error: 'Could not transcribe audio' })

    // Sentiment with Claude
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 20,
      messages: [{ role: 'user', content: `Classify the sentiment of this message as exactly one word: positive, negative, or neutral.\n\n"${transcript}"` }],
    })
    const sentiment = msg.content[0].text.trim().toLowerCase().replace(/[^a-z]/g, '')

    const { data, error } = await supabase
      .from('voice_notes').update({ transcript, sentiment }).eq('id', id).select().single()
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

// POST /api/text-feedback — typed message, auto-analyse sentiment with Claude
router.post('/text-feedback', async (req, res) => {
  try {
    const { recipient_id, class_id, transcript } = req.body
    if (!transcript) return res.status(400).json({ error: 'transcript required' })

    // Sentiment with Claude
    let sentiment = null
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 20,
        messages: [{ role: 'user', content: `Classify the sentiment of this message as exactly one word: positive, negative, or neutral.\n\n"${transcript}"` }],
      })
      sentiment = msg.content[0].text.trim().toLowerCase().replace(/[^a-z]/g, '')
    } catch (_) {}

    const { data, error } = await supabase.from('voice_notes').insert({
      sender_id: req.user.id, recipient_id, class_id,
      transcript, sentiment, type: 'text',
      storage_path: null, duration_secs: null,
    }).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/sentiment — all sentiment records for admin (service role bypasses RLS)
router.get('/admin/sentiment', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('sentiment, transcript, created_at, sender:sender_id(full_name)')
      .not('sentiment', 'is', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sentiment — aggregate sentiment for teacher dashboard
router.get('/sentiment', async (req, res) => {
  try {
    const uid = req.user.id
    const { data, error } = await supabase
      .from('voice_notes')
      .select('sentiment, created_at, transcript, sender:sender_id(full_name), recipient:recipient_id(full_name)')
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .not('sentiment', 'is', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
