import { useState } from 'react'
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Exam Type</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={row.subject_id}>
                  <td className="py-2 pr-3 font-medium text-gray-700">{row.subjectName}</td>
                  <td className="py-2 pr-3">
                    <select
                      value={row.exam_type}
                      onChange={(e) => updateRow(i, 'exam_type', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number" min="0" max={row.max_score}
                      value={row.score}
                      onChange={(e) => updateRow(i, 'score', e.target.value)}
                      placeholder="—"
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number" min="1"
                      value={row.max_score}
                      onChange={(e) => updateRow(i, 'max_score', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
