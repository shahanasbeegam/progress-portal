import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import SubjectBar from '../../components/charts/SubjectBar.jsx'
import SubjectRadar from '../../components/charts/SubjectRadar.jsx'
import ScoreLine from '../../components/charts/ScoreLine.jsx'
import ScoreHeatmap from '../../components/charts/ScoreHeatmap.jsx'
import { api } from '../../lib/api.js'

export default function ParentCharts() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const child = await api.get('/parent/child')
        if (!child) return
        const m = await api.get(`/marks?student_id=${child.id}`)
        setMarks(m)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/parent" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Charts</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {marks.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No marks data available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <SubjectBar marks={marks} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SubjectRadar marks={marks} />
              <ScoreLine marks={marks} />
            </div>
            <ScoreHeatmap marks={marks} />
          </div>
        )}
      </main>
    </div>
  )
}
