import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'
import { api } from '../../lib/api.js'

export default function VoiceRecorder({ recipientId, classId, onSent }) {
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const startRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  async function startRecording() {
    setError('')
    setLiveTranscript('')
    transcriptRef.current = ''
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.start()
      mediaRef.current = recorder
      startRef.current = Date.now()

      // Web Speech API for real-time transcription
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.onresult = (e) => {
          const text = Array.from(e.results).map((r) => r[0].transcript).join(' ')
          transcriptRef.current = text
          setLiveTranscript(text)
        }
        recognition.start()
        recognitionRef.current = recognition
      }

      setState('recording')
    } catch {
      setError('Microphone access denied.')
    }
  }

  async function stopAndSend() {
    if (!mediaRef.current) return
    setState('uploading')
    recognitionRef.current?.stop()
    mediaRef.current.stop()
    mediaRef.current.stream.getTracks().forEach((t) => t.stop())

    await new Promise((r) => (mediaRef.current.onstop = r))
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const duration = Math.round((Date.now() - startRef.current) / 1000)
    const path = `recordings/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`
    const transcript = transcriptRef.current || null

    try {
      const { error: upErr } = await supabase.storage.from('voice-notes').upload(path, blob)
      if (upErr) throw upErr
      const note = await api.post('/voice-notes', {
        storage_path: path, recipient_id: recipientId,
        class_id: classId, duration_secs: duration, transcript,
      })
      // Run sentiment analysis if we have a transcript
      if (transcript) api.post(`/voice-notes/${note.id}/transcribe`).catch(() => {})
      onSent?.(note)
      setLiveTranscript('')
      setState('idle')
    } catch (e) {
      setError(e.message)
      setState('idle')
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span className="w-2 h-2 bg-white rounded-full" /> Record
        </button>
      )}
      {state === 'recording' && (
        <div className="space-y-2">
          <button
            onClick={stopAndSend}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg animate-pulse"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full" /> Stop & Send
          </button>
          {liveTranscript && (
            <p className="text-xs text-gray-500 italic">"{liveTranscript}"</p>
          )}
        </div>
      )}
      {state === 'uploading' && (
        <p className="text-sm text-gray-500">Uploading…</p>
      )}
    </div>
  )
}
