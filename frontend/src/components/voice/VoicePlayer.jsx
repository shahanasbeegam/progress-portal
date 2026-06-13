import { useState } from 'react'
import { api } from '../../lib/api.js'

export default function VoicePlayer({ noteId, duration }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div>
      {!url ? (
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-primary-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Loading…' : `▶ Play ${duration ? `(${duration}s)` : ''}`}
        </button>
      ) : (
        <audio controls src={url} className="w-full h-8 mt-1" />
      )}
    </div>
  )
}
