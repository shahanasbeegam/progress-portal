import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ScoreLine({ marks }) {
  // Group by exam_type, average percentage
  const byExam = {}
  marks.forEach((m) => {
    const key = m.exam_type
    if (!byExam[key]) byExam[key] = { total: 0, count: 0 }
    byExam[key].total += m.max_score > 0 ? (m.score / m.max_score) * 100 : 0
    byExam[key].count++
  })

  const data = Object.entries(byExam).map(([exam, { total, count }]) => ({
    exam,
    avg: Math.round(total / count),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Performance Trend by Exam</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
          <Legend />
          <Line type="monotone" dataKey="avg" name="Avg %" stroke="#6366f1" strokeWidth={2} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
