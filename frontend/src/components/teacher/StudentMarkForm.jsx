import { useState, useCallback } from 'react'
import { api } from '../../lib/api.js'

const EXAM_TYPES = ['unit_test', 'midterm', 'final', 'assignment']
const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Annual']

export default function StudentMarkForm({ studentId, subjects, onSaved, onError }) {
  const initialRows = () => subjects.map((s) => ({
    subject_id: s.id,
    subjectName: s.name,
    exam_type: 'midterm',
    score: '',
    max_score: '100',
    feedback: '',
    suggestions: [],
    loadingSuggestions: false,
  }))

  const [rows, setRows] = useState(initialRows)
  const [term, setTerm] = useState('Term 1')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [summary, setSummary] = useState(null)

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }

  async function fetchSuggestions(index, row) {
    const score = parseFloat(row.score)
    const max = parseFloat(row.max_score)
    if (!row.score || isNaN(score) || isNaN(max) || max <= 0) return
    const pct = (score / max) * 100
    if (pct >= 65) {
      setRows(prev => prev.map((r, i) => i === index ? { ...r, suggestions: [] } : r))
      return
    }
    setRows(prev => prev.map((r, i) => i === index ? { ...r, loadingSuggestions: true, suggestions: [] } : r))
    try {
      const { suggestions } = await api.post('/feedback-suggestions', {
        subject: row.subjectName, score, max_score: max,
      })
      setRows(prev => prev.map((r, i) => i === index ? { ...r, suggestions: suggestions ?? [], loadingSuggestions: false } : r))
    } catch {
      setRows(prev => prev.map((r, i) => i === index ? { ...r, loadingSuggestions: false } : r))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const marks = rows
        .filter((r) => r.score !== '')
        .map(({ subject_id, exam_type, score, max_score }) => ({
          student_id: studentId, subject_id, exam_type,
          score: parseFloat(score), max_score: parseFloat(max_score),
        }))
      if (!marks.length) throw new Error('Enter at least one score')
      await api.post('/marks', { marks })
      setSaved(true)
      onSaved()
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setSummary(null)
    try {
      const result = await api.post('/summaries/generate', { student_id: studentId, term })
      setSummary(result)
    } catch (e) {
      onError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Marks Entry</h3>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            {TERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row.subject_id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="font-medium text-gray-700 w-28 shrink-0">{row.subjectName}</span>
                <select
                  value={row.exam_type}
                  onChange={(e) => updateRow(i, 'exam_type', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                >
                  {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input
                  type="number" min="0" max={row.max_score}
                  value={row.score}
                  onChange={(e) => updateRow(i, 'score', e.target.value)}
                  onBlur={() => fetchSuggestions(i, row)}
                  placeholder="Score"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                />
                <span className="text-gray-400 text-sm">/</span>
                <input
                  type="number" min="1"
                  value={row.max_score}
                  onChange={(e) => updateRow(i, 'max_score', e.target.value)}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                />
                {row.score && row.max_score && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(row.score/row.max_score)*100 >= 65 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {Math.round((parseFloat(row.score)/parseFloat(row.max_score))*100)}%
                  </span>
                )}
              </div>

              {/* Feedback suggestions */}
              {row.loadingSuggestions && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><span className="animate-spin inline-block">⟳</span> Getting AI suggestions…</p>
              )}
              {row.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400 font-medium">AI Feedback Suggestions — click to use:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {row.suggestions.map((s, si) => (
                      <button
                        key={si}
                        type="button"
                        onClick={() => {
                          updateRow(i, 'feedback', s)
                          updateRow(i, 'suggestions', [])
                        }}
                        className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition-colors text-left max-w-xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(row.feedback || row.suggestions.length > 0 || ((row.score && (row.score/row.max_score)*100 < 65))) && (
                <textarea
                  value={row.feedback}
                  onChange={(e) => updateRow(i, 'feedback', e.target.value)}
                  placeholder="Feedback for parent (optional)"
                  rows={2}
                  className="mt-2 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white resize-none"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save Marks'}
        </button>
      </div>

      {saved && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Generate AI Summary</h3>
          <p className="text-sm text-gray-500 mb-3">
            Claude will analyse the marks and generate a parent-friendly progress summary for {term}.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {generating ? 'Generating…' : 'Generate AI Summary'}
          </button>

          {summary && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-xs font-semibold text-indigo-600 mb-2">AI-Generated Summary (pending approval)</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.summary_text}</p>
              <p className="text-xs text-gray-400 mt-2">Go to Summaries page to review and approve.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
