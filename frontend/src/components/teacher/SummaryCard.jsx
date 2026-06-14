import { useState } from 'react'

export default function SummaryCard({ summary, showApprove, onApprove, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(summary.summary_text)
  const [saving, setSaving] = useState(false)

  const studentName = summary.students?.full_name ?? 'Unknown student'
  const className = summary.students?.classes?.name ?? ''

  async function handleSaveEdit() {
    setSaving(true)
    await onEdit(text)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">{studentName}</p>
          <p className="text-xs text-gray-500">{className} · {summary.term}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            summary.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {summary.approved ? 'Approved' : 'Pending'}
          </span>
          {summary.acknowledged_at ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium" title={`Seen on ${new Date(summary.acknowledged_at).toLocaleString('en-IN')}`}>
              ✅ Parent seen
            </span>
          ) : summary.approved ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
              ⏳ Awaiting parent
            </span>
          ) : null}
        </div>
      </div>

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
      )}

      <div className="flex gap-2 mt-4">
        {showApprove && !editing && (
          <>
            <button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setEditing(true)}
              className="border border-gray-300 hover:border-gray-400 text-gray-600 text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              Edit
            </button>
          </>
        )}
        {editing && (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setText(summary.summary_text); setEditing(false) }}
              className="border border-gray-300 text-gray-600 text-sm px-4 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
