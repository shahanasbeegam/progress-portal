import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import VoicePlayer from '../../components/voice/VoicePlayer.jsx'
import { api } from '../../lib/api.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function TeacherVoiceNotes() {
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [parents, setParents] = useState([])
  const [recipientType, setRecipientType] = useState('individual')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    Promise.all([api.get('/voice-notes'), api.get('/classes')])
      .then(([n, c]) => { setNotes(n); setClasses(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function loadParents(classId) {
    setSelectedClass(classId)
    try {
      const students = await api.get(`/students?class_id=${classId}`)
      setParents(students)
    } catch (e) { console.error(e) }
  }

  const sent = notes.filter((n) => n.sender_id === profile?.id)
  const received = notes.filter((n) => n.recipient_id === profile?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/teacher" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Notes</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Send Voice Note</h3>
          <div className="flex gap-2">
            {['individual', 'class'].map((t) => (
              <button key={t} onClick={() => setRecipientType(t)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${recipientType === t ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600'}`}>
                {t === 'individual' ? 'To Parent' : 'To Class'}
              </button>
            ))}
          </div>
          <select value={selectedClass} onChange={(e) => loadParents(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {recipientType === 'individual' && parents.length > 0 && (
            <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select student/parent</option>
              {parents.map((s) => <option key={s.id} value={s.parent_profile_id ?? s.id}>{s.full_name}</option>)}
            </select>
          )}
          <VoiceRecorder
            recipientId={recipientType === 'individual' ? selectedRecipient : null}
            classId={recipientType === 'class' ? selectedClass : null}
            onSent={(n) => setNotes((prev) => [n, ...prev])}
          />
        </div>

        <NoteList title="Sent" notes={sent} loading={loading} />
        <NoteList title="Received from Parents" notes={received} loading={false} />
      </main>
    </div>
  )
}

function NoteList({ title, notes, loading }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">{n.recipient?.full_name ?? (n.class_id ? 'Class broadcast' : 'Unknown')}</p>
                <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              <VoicePlayer noteId={n.id} duration={n.duration_secs} />
              {n.transcript && <p className="text-xs text-gray-500 mt-2 italic">"{n.transcript}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
