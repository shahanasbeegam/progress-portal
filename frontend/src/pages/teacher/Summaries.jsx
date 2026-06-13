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
  const navigate = useNavigate()

  useEffect(() => {
    fetchSummaries()
  }, [tab])

  async function fetchSummaries() {
    setLoading(true)
    try {
      const approved = tab === 'approved'
      const data = await api.get(`/summaries?approved=${approved}`)
      setSummaries(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
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
      setSummaries((prev) => prev.map((s) => s.id === id ? { ...s, summary_text: updated.summary_text } : s))
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Summaries</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="flex gap-2 mb-6">
          {['pending', 'approved'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-primary-400'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : summaries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">
            No {tab} summaries found.
          </p>
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
