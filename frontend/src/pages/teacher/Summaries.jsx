import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import SummaryCard from '../../components/teacher/SummaryCard.jsx'
import { api } from '../../lib/api.js'

export default function Summaries() {
  const [summaries, setSummaries] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [term, setTerm] = useState('Term 1')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchSummaries() }, [tab])
  useEffect(() => { api.get('/classes').then(setClasses).catch(console.error) }, [])

  async function fetchSummaries() {
    setLoading(true)
    try {
      const data = await api.get(`/summaries?approved=${tab === 'approved'}`)
      setSummaries(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClassChange(classId) {
    setSelectedClass(classId)
    setSelectedStudent('')
    if (!classId) return setStudents([])
    const s = await api.get(`/students?class_id=${classId}`)
    setStudents(s)
  }

  async function handleGenerate() {
    if (!selectedStudent || !term) return setError('Select a student and term')
    setGenerating(true)
    setError('')
    try {
      const saved = await api.post('/summaries/generate', { student_id: selectedStudent, term })
      setTab('pending')
      setSummaries((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)])
      setShowForm(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove(id) {
    try {
      await api.put(`/summaries/${id}/approve`)
      setSummaries((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleEdit(id, text) {
    try {
      const updated = await api.put(`/summaries/${id}`, { summary_text: text })
      setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, summary_text: updated.summary_text } : s)))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/teacher')} className="text-sm text-primary-600 hover:underline mb-4 inline-block">
          ← Back to dashboard
        </button>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Summaries</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Generate Summary'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-3">
            <h3 className="font-semibold text-gray-800">Generate AI Progress Summary</h3>
            <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {students.length > 0 && (
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            )}
            <select value={term} onChange={(e) => setTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {['Term 1', 'Term 2', 'Term 3', 'Mid-Year', 'Annual'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedStudent}
              className="w-full py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating with Claude AI…' : 'Generate Summary'}
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {['pending', 'approved'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-primary-400'
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : summaries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No {tab} summaries. Click "+ Generate Summary" to create one.</p>
        ) : (
          <div className="space-y-4">
            {summaries.map((s) => (
              <SummaryCard
                key={s.id}
                summary={s}
                showApprove={tab === 'pending'}
                onApprove={() => handleApprove(s.id)}
                onEdit={(text) => handleEdit(s.id, text)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
