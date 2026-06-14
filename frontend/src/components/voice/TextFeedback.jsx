import { useState } from 'react'
import { api } from '../../lib/api.js'

export default function TextFeedback({ recipientId, classId, onSent }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    setError('')
    try {
      const note = await api.post('/text-feedback', {
        recipient_id: recipientId,
        class_id: classId,
        transcript: text.trim(),
      })
      onSent?.(note)
      setText('')
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
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type your message here…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </div>
  )
}
