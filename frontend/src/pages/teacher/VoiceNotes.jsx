import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import VoicePlayer from '../../components/voice/VoicePlayer.jsx'
import TextFeedback from '../../components/voice/TextFeedback.jsx'
import { api } from '../../lib/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'

export default function TeacherVoiceNotes() {
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [parents, setParents] = useState([])
  const [recipientType, setRecipientType] = useState('individual')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [inputMode, setInputMode] = useState('voice') // 'voice' | 'text'
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

  function addNote(n) {
    setNotes((prev) => [n, ...prev])
    toast.success('Message sent!')
  }

  const recipientId = recipientType === 'individual' ? selectedRecipient : null
  const classId = recipientType === 'class' ? selectedClass : null

  const sent = notes.filter((n) => n.sender_id === profile?.id)
  const received = notes.filter((n) => n.recipient_id === profile?.id)

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <Link to="/teacher" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Send Message</h3>

          {/* Recipient type */}
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

          {/* Input mode toggle */}
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
            <VoiceRecorder recipientId={recipientId} classId={classId} onSent={addNote} />
          ) : (
            <TextFeedback recipientId={recipientId} classId={classId} onSent={addNote} />
          )}
        </div>

        <NoteList title="Sent" notes={sent} loading={loading} />
        <NoteList title="Received from Parents" notes={received} loading={false} />
      </div>
    </Sidebar>
  )
}

function NoteList({ title, notes, loading }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : notes.length === 0 ? (
        <p className="text-sm text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">
                    {n.recipient?.full_name ?? (n.class_id ? 'Class broadcast' : 'Unknown')}
                  </p>
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
