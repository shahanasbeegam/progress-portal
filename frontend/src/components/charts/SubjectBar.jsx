import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function SubjectBar({ marks }) {
  const data = marks.map((m) => ({
    subject: m.subjects?.name ?? 'Unknown',
    percent: m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : 0,
  }))

  const color = (pct) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Subject-wise Performance</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="subject" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={color(d.percent)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
