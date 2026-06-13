import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import VoicePlayer from '../../components/voice/VoicePlayer.jsx'
import { api } from '../../lib/api.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function ParentVoiceNotes() {
  const [notes, setNotes] = useState([])
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { profile } = useAuth()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [n, child] = await Promise.all([api.get('/voice-notes'), api.get('/parent/child')])
      setNotes(n)
      // Find the teacher from received notes
      const received = n.find((note) => note.sender?.role === 'teacher')
      if (received) setTeacher({ id: received.sender_id, name: received.sender?.full_name })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const received = notes.filter((n) => n.recipient_id === profile?.id || n.recipient_id === null)
  const sent = notes.filter((n) => n.sender_id === profile?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/parent" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Notes</h2>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {teacher && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Send Message to {teacher.name}</h3>
            <VoiceRecorder recipientId={teacher.id} onSent={(n) => { setNotes((prev) => [n, ...prev]); load() }} />
          </div>
        )}

        <Section title="Received" notes={received} loading={loading} emptyMsg="No messages received yet." currentUserId={profile?.id} />
        <Section title="Sent" notes={sent} loading={false} emptyMsg="No messages sent yet." currentUserId={profile?.id} />
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
                <p className="text-sm font-medium text-gray-700">{n.sender?.full_name ?? 'Unknown'}</p>
                <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              <VoicePlayer noteId={n.id} duration={n.duration_secs} />
              {n.transcript && <p className="text-xs text-gray-500 mt-2 italic">"{n.transcript}"</p>}
              {n.sentiment && (
                <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
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
