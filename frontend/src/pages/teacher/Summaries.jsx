import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import SummaryCard from '../../components/teacher/SummaryCard.jsx'
import { api } from '../../lib/api.js'
import toast from 'react-hot-toast'

export default function Summaries() {
  const [summaries, setSummaries] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [term, setTerm] = useState('Term 1')
  const [showForm, setShowForm] = useState(false)
  const [tone, setTone] = useState('warm')
  const [bulkGenerating, setBulkGenerating] = useState(false)
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
    if (!selectedStudent || !term) return toast.error('Select a student and term')
    setGenerating(true)
    try {
      const saved = await api.post('/summaries/generate', { student_id: selectedStudent, term, tone })
      setTab('pending')
      setSummaries((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)])
      setShowForm(false)
      toast.success('AI Summary generated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleBulkGenerate() {
    if (!selectedClass || !term) return toast.error('Select a class and term')
    setBulkGenerating(true)
    const studentList = students.length ? students : await api.get(`/students?class_id=${selectedClass}`)
    let count = 0
    for (const s of studentList) {
      try {
        await api.post('/summaries/generate', { student_id: s.id, term, tone })
        count++
      } catch { /* skip failures */ }
    }
    setBulkGenerating(false)
    setTab('pending')
    await fetchSummaries()
    toast.success(`Generated ${count} summaries!`)
  }

  async function handleApprove(id) {
    try {
      await api.put(`/summaries/${id}/approve`)
      setSummaries((prev) => prev.filter((s) => s.id !== id))
      toast.success('Summary approved — parent can now see it')
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function handleEdit(id, text) {
    try {
      const updated = await api.put(`/summaries/${id}`, { summary_text: text })
      setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, summary_text: updated.summary_text } : s)))
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-3xl mx-auto">
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
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Comment Tone</p>
              <div className="flex gap-2">
                {['warm', 'formal', 'concise'].map(t => (
                  <button key={t} type="button" onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tone === t ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:border-primary-400'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedStudent}
                className="flex-1 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating…' : 'Generate for Student'}
              </button>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkGenerating || !selectedClass}
                title="Generate for all students in selected class"
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {bulkGenerating ? '…' : 'All'}
              </button>
            </div>
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
      </div>
    </Sidebar>
  )
}
