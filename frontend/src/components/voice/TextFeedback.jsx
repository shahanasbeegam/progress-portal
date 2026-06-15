import { useState } from 'react'
import { api } from '../../lib/api.js'

export default function TextFeedback({ recipientId, classId, onSent }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [toneCheck, setToneCheck] = useState(null) // { suggestion: string }

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    setError('')
    setToneCheck(null)

    // Tone check — must complete in < 2s or skip
    try {
      const result = await Promise.race([
        api.post('/tone-check', { message: text.trim() }),
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 2000)),
      ])
      if (!result.ok && result.suggestion) {
        setSending(false)
        setToneCheck({ suggestion: result.suggestion })
        return
      }
    } catch {
      // If tone check fails, proceed with send
    }

    await doSend(text.trim())
  }

  async function doSend(message) {
    setSending(true)
    try {
      const note = await api.post('/text-feedback', {
        recipient_id: recipientId,
        class_id: classId,
        transcript: message,
      })
      onSent?.(note)
      setText('')
      setToneCheck(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setToneCheck(null) }}
        rows={3}
        placeholder="Type your message here…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Tone check banner */}
      {toneCheck && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-amber-800">⚠️ This message may come across as critical</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded border border-gray-200 p-2">
              <p className="text-gray-400 font-medium mb-1">Your original</p>
              <p className="text-gray-700">{text}</p>
            </div>
            <div className="bg-white rounded border border-green-200 p-2">
              <p className="text-green-600 font-medium mb-1">Suggested rewrite</p>
              <p className="text-gray-700">{toneCheck.suggestion}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => doSend(text)}
              disabled={sending}
              className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Send my original
            </button>
            <button
              onClick={() => doSend(toneCheck.suggestion)}
              disabled={sending}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              Send the suggestion
            </button>
            <button
              onClick={() => { setText(toneCheck.suggestion); setToneCheck(null) }}
              className="text-xs text-primary-600 hover:underline px-2"
            >
              Edit suggestion
            </button>
          </div>
        </div>
      )}

      {!toneCheck && (
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {sending ? 'Checking…' : 'Send Message'}
        </button>
      )}
    </div>
  )
}
