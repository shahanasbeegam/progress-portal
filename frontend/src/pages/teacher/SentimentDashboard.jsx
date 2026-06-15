import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { api } from '../../lib/api.js'

const COLORS = { positive: '#22c55e', neutral: '#94a3b8', negative: '#ef4444' }

export default function SentimentDashboard() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/sentiment')
      .then(setNotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const counts = notes.reduce((acc, n) => {
    acc[n.sentiment] = (acc[n.sentiment] ?? 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <Link to="/teacher" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Parent Sentiment Dashboard</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No voice notes with sentiment data yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {['positive', 'neutral', 'negative'].map((s) => (
                <div key={s} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: COLORS[s] }}>{counts[s] ?? 0}</p>
                  <p className="text-sm text-gray-500 capitalize">{s}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] ?? '#94a3b8'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Messages</h3>
              <div className="space-y-3">
                {notes.slice(0, 10).map((n, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {n.sentiment}
                    </span>
                    <p className="text-gray-600 italic flex-1">"{n.transcript}"</p>
                    <p className="text-xs text-gray-400 shrink-0">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
