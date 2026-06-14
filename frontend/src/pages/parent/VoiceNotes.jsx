import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import VoicePlayer from '../../components/voice/VoicePlayer.jsx'
import TextFeedback from '../../components/voice/TextFeedback.jsx'
import { api } from '../../lib/api.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function ParentVoiceNotes() {
  const [notes, setNotes] = useState([])
  const [teacher, setTeacher] = useState(null)
  const [inputMode, setInputMode] = useState('voice')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { profile } = useAuth()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [n] = await Promise.all([api.get('/voice-notes')])
      setNotes(n)
      const received = n.find((note) => note.sender?.role === 'teacher')
      if (received) setTeacher({ id: received.sender_id, name: received.sender?.full_name })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function addNote(n) { setNotes((prev) => [n, ...prev]) }

  const received = notes.filter((n) => n.recipient_id === profile?.id || n.recipient_id === null)
  const sent = notes.filter((n) => n.sender_id === profile?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/parent" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {teacher && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Message to {teacher.name}</h3>
            <div className="flex gap-2 border-b border-gray-100 pb-3">
              <button onClick={() => setInputMode('voice')}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${inputMode === 'voice' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                🎙 Voice
              </button>
              <button onClick={() => setInputMode('text')}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${inputMode === 'text' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                ✏️ Type
              </button>
            </div>
            {inputMode === 'voice' ? (
              <VoiceRecorder recipientId={teacher.id} onSent={addNote} />
            ) : (
              <TextFeedback recipientId={teacher.id} onSent={addNote} />
            )}
          </div>
        )}

        <Section title="Received" notes={received} loading={loading} emptyMsg="No messages received yet." />
        <Section title="Sent" notes={sent} loading={false} emptyMsg="No messages sent yet." />
      </main>
    </div>
  )
}

function Section({ title, notes, loading, emptyMsg }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : notes.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMsg}</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">{n.sender?.full_name ?? 'Unknown'}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {n.type === 'text' ? '✏️ Text' : '🎙 Voice'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {n.type === 'text' ? (
                <p className="text-sm text-gray-700">"{n.transcript}"</p>
              ) : (
                <VoicePlayer noteId={n.id} duration={n.duration_secs} transcript={n.transcript} sentiment={n.sentiment} />
              )}
              {n.sentiment && (
                <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full font-medium ${n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {n.sentiment}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
