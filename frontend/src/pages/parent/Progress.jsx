import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { api } from '../../lib/api.js'

export default function ParentProgress() {
  const [child, setChild] = useState(null)
  const [marks, setMarks] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ackLoading, setAckLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const c = await api.get('/parent/child')
        setChild(c)
        if (!c) return
        const [m, s] = await Promise.all([
          api.get(`/marks?student_id=${c.id}`),
          api.get(`/summaries?student_id=${c.id}&approved=true`),
        ])
        setMarks(m)
        setSummary(s?.[0] ?? null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function acknowledge() {
    if (!summary) return
    setAckLoading(true)
    try {
      const updated = await api.put(`/summaries/${summary.id}/acknowledge`)
      setSummary(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setAckLoading(false)
    }
  }

  const overall = marks.length
    ? Math.round(marks.reduce((acc, m) => acc + (m.max_score > 0 ? (m.score / m.max_score) * 100 : 0), 0) / marks.length)
    : null

  // Build subject averages for study suggestions
  const subjectMap = {}
  marks.forEach(m => {
    const name = m.subjects?.name ?? 'Unknown'
    if (!subjectMap[name]) subjectMap[name] = { total: 0, count: 0, score: m.score, max: m.max_score }
    if (m.max_score > 0) { subjectMap[name].total += (m.score / m.max_score) * 100; subjectMap[name].count++ }
    subjectMap[name].score = m.score; subjectMap[name].max = m.max_score
  })
  const weakSubjects = Object.entries(subjectMap)
    .map(([name, d]) => ({ name, avg: Math.round(d.total / d.count), score: d.score, max: d.max }))
    .filter(s => s.avg < 65)

  if (loading) return <Spinner />

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <Link to="/parent" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Progress Report</h2>
        {child && <p className="text-gray-500 text-sm mb-6">{child.full_name} · {child.classes?.name}</p>}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
        {!child && !error && <p className="text-gray-500">No student linked to your account. Contact admin.</p>}

        {overall !== null && (
          <div className="bg-primary-600 rounded-xl p-6 text-white mb-6 text-center">
            <p className="text-sm opacity-80 mb-1">Overall Performance</p>
            <p className="text-5xl font-bold">{overall}%</p>
            <p className="text-sm opacity-80 mt-1">{overall >= 75 ? 'Excellent' : overall >= 50 ? 'Good' : 'Needs Improvement'}</p>
          </div>
        )}

        {summary && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <p className="text-xs font-semibold text-primary-600 mb-2">AI Progress Summary · {summary.term}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{summary.summary_text}</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
              {summary.acknowledged_at ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="text-sm font-medium">Acknowledged</p>
                    <p className="text-xs text-green-600">
                      You confirmed you have seen this report on {new Date(summary.acknowledged_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <button
                    onClick={acknowledge}
                    disabled={ackLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {ackLoading ? 'Please wait…' : '✅ I have seen this report'}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Clicking this lets the teacher know you have reviewed the progress report.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {weakSubjects.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-amber-800 mb-3 text-sm">📚 Subjects Needing Support</h3>
            <div className="space-y-4">
              {weakSubjects.map(s => (
                <div key={s.name} className="bg-white rounded-lg border border-amber-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 text-sm">{s.name}</span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{s.avg}%</span>
                  </div>
                  <StudySuggestions subject={s.name} score={s.score} maxScore={s.max} />
                </div>
              ))}
            </div>
          </div>
        )}

        {marks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Marks Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b text-xs">
                    <th className="pb-2">Subject</th><th className="pb-2">Exam</th>
                    <th className="pb-2">Score</th><th className="pb-2">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {marks.map((m) => {
                    const pct = m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : 0
                    return (
                      <tr key={m.id}>
                        <td className="py-2 font-medium">{m.subjects?.name}</td>
                        <td className="py-2 text-gray-500 capitalize">{m.exam_type}</td>
                        <td className="py-2">{m.score}/{m.max_score}</td>
                        <td className={`py-2 font-semibold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}

function StudySuggestions({ subject, score, maxScore }) {
  const [suggestions, setSuggestions] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (suggestions) { setOpen(v => !v); return }
    setOpen(true); setLoading(true)
    try {
      const { suggestions: s } = await api.get(
        `/parent/study-suggestions?subject=${encodeURIComponent(subject)}&score=${score}&max_score=${maxScore}`
      )
      setSuggestions(s)
    } catch { setSuggestions(['Review your child\'s notes together each evening.', `Look for free ${subject} practice worksheets online.`, 'Ask their teacher for recommended resources.']) }
    finally { setLoading(false) }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button onClick={load} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
        {open ? '▲' : '▼'} How you can help at home
      </button>
      {open && (
        <div className="mt-2">
          {loading ? <p className="text-xs text-gray-400">Getting suggestions…</p> : suggestions && (
            <ol className="space-y-1.5">
              {suggestions.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-primary-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
}
