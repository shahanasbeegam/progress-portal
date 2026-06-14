import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import SubjectBar from '../../components/charts/SubjectBar.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { supabase } from '../../lib/supabase.js'

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="charts" element={<StudentCharts />} />
      </Routes>
    </div>
  )
}

function StudentHome() {
  const { profile } = useAuth()
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {profile?.full_name ?? 'Student'}</h2>
      <p className="text-gray-500 text-sm mb-8">Student Dashboard</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="progress" className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-800 mb-1">My Progress</h3>
          <p className="text-sm text-gray-500">View your marks and AI progress summary</p>
        </Link>
        <Link to="charts" className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-800 mb-1">Charts</h3>
          <p className="text-sm text-gray-500">See your performance trends</p>
        </Link>
      </div>
    </main>
  )
}

function useStudentData() {
  const { profile } = useAuth()
  const [marks, setMarks] = useState([])
  const [summary, setSummary] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data: st } = await supabase.from('students')
        .select('id, full_name, roll_number, classes(name)')
        .eq('profile_id', profile.id)
        .maybeSingle()
      if (!st) return setLoading(false)
      setStudent(st)
      const [{ data: m }, { data: s }] = await Promise.all([
        supabase.from('marks').select('*, subjects(name)').eq('student_id', st.id).order('entered_at', { ascending: false }),
        supabase.from('ai_summaries').select('summary_text, term').eq('student_id', st.id).eq('approved', true).order('created_at', { ascending: false }).limit(1),
      ])
      setMarks(m ?? [])
      setSummary(s?.[0] ?? null)
      setLoading(false)
    }
    load()
  }, [profile])

  return { marks, summary, student, loading }
}

function StudentProgress() {
  const { marks, summary, student, loading } = useStudentData()
  const overall = marks.length
    ? Math.round(marks.reduce((acc, m) => acc + (m.max_score > 0 ? (m.score / m.max_score) * 100 : 0), 0) / marks.length)
    : null

  if (loading) return <Spinner />
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/student" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">My Progress</h2>
      {student && <p className="text-gray-500 text-sm mb-6">{student.full_name} · {student.classes?.name}</p>}

      {!student && <p className="text-gray-500">Your student record is not linked yet. Contact admin.</p>}

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
          <p className="text-sm text-gray-700 leading-relaxed">{summary.summary_text}</p>
        </div>
      )}

      {marks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Marks Detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b text-xs">
                <th className="pb-2">Subject</th><th className="pb-2">Exam</th><th className="pb-2">Score</th><th className="pb-2">%</th>
              </tr></thead>
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
    </main>
  )
}

function StudentCharts() {
  const { marks, loading } = useStudentData()
  if (loading) return <Spinner />
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/student" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Charts</h2>
      {marks.length === 0
        ? <p className="text-gray-500 text-center py-12">No marks data yet.</p>
        : <SubjectBar marks={marks} />}
    </main>
  )
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
}
