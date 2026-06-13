export default function ScoreHeatmap({ marks }) {
  const subjects = [...new Set(marks.map((m) => m.subjects?.name ?? 'Unknown'))]
  const exams = [...new Set(marks.map((m) => m.exam_type))]

  function getScore(subject, exam) {
    const m = marks.find((m) => m.subjects?.name === subject && m.exam_type === exam)
    if (!m) return null
    return m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : null
  }

  function cellColor(pct) {
    if (pct === null) return 'bg-gray-100 text-gray-400'
    if (pct >= 75) return 'bg-green-500 text-white'
    if (pct >= 50) return 'bg-yellow-400 text-white'
    return 'bg-red-400 text-white'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Score Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="text-left py-1 pr-3 text-gray-500 font-medium">Subject</th>
              {exams.map((e) => <th key={e} className="px-2 py-1 text-gray-500 font-medium capitalize">{e}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((s) => (
              <tr key={s}>
                <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">{s}</td>
                {exams.map((e) => {
                  const pct = getScore(s, e)
                  return (
                    <td key={e} className="px-1 py-1 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 font-semibold ${cellColor(pct)}`}>
                        {pct !== null ? `${pct}%` : '—'}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" />≥75%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" />50–74%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />&lt;50%</span>
      </div>
    </div>
  )
}
