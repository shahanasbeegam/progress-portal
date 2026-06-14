import { useState } from 'react'
import { api } from '../../lib/api.js'

const SENTIMENT_COLOR = {
  positive: 'text-green-600 bg-green-50',
  negative: 'text-red-600 bg-red-50',
  neutral: 'text-gray-600 bg-gray-50',
}

export default function VoicePlayer({ noteId, duration, transcript, sentiment, onTranscribed }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [localTranscript, setLocalTranscript] = useState(transcript)
  const [localSentiment, setLocalSentiment] = useState(sentiment)
  const [transcribeError, setTranscribeError] = useState('')

  async function load() {
    if (url) return
    setLoading(true)
    try {
      const { url: signedUrl } = await api.get(`/voice-notes/signed-url/${noteId}`)
      setUrl(signedUrl)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleTranscribe() {
    setTranscribing(true)
    try {
      const updated = await api.post(`/voice-notes/${noteId}/transcribe`)
      setLocalTranscript(updated.transcript)
      setLocalSentiment(updated.sentiment)
      onTranscribed?.(updated)
    } catch (e) {
      setTranscribeError(e.message)
    } finally {
      setTranscribing(false)
    }
  }

  return (
    <div className="space-y-1">
      {!url ? (
        <button onClick={load} disabled={loading}
          className="text-xs text-primary-600 hover:underline disabled:opacity-50">
          {loading ? 'Loading…' : `▶ Play ${duration ? `(${duration}s)` : ''}`}
        </button>
      ) : (
        <audio controls src={url} className="w-full h-8 mt-1" />
      )}

      {transcribeError && <p className="text-xs text-red-600">{transcribeError}</p>}
      {!localTranscript && (
        <button onClick={handleTranscribe} disabled={transcribing}
          className="text-xs text-indigo-600 hover:underline disabled:opacity-50 block">
          {transcribing ? 'Transcribing…' : '🎙 Transcribe & Analyse Sentiment'}
        </button>
      )}

      {localTranscript && (
        <p className="text-xs text-gray-500 italic mt-1">"{localTranscript}"</p>
      )}
      {localSentiment && (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${SENTIMENT_COLOR[localSentiment] ?? 'text-gray-600 bg-gray-50'}`}>
          {localSentiment}
        </span>
      )}
    </div>
  )
}
