import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function SubjectRadar({ marks }) {
  const data = marks.map((m) => ({
    subject: m.subjects?.name ?? 'Unknown',
    score: m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : 0,
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Performance Radar</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
          <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
