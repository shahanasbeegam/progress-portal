import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { api } from '../../lib/api.js'

function StatCard({ label, value, color, icon, loading }) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${color}`}>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-12" />
          <div className="skeleton h-3 w-24" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">{icon}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </>
      )}
    </div>
  )
}

const STATUS = {
  excellent: { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' },
  on_track: { label: 'On Track', color: 'bg-teal-100 text-teal-700' },
  at_risk: { label: 'At Risk', color: 'bg-amber-100 text-amber-700' },
  needs_attention: { label: 'Needs Attention', color: 'bg-red-100 text-red-700' },
}

function getStatus(avg) {
  if (avg >= 85) return 'excellent'
  if (avg >= 65) return 'on_track'
  if (avg >= 50) return 'at_risk'
  return 'needs_attention'
}

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [atRisk, setAtRisk] = useState([])
  const [riskPanel, setRiskPanel] = useState(null)
  const [dismissedFlags, setDismissedFlags] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed_risk_flags') || '{}') } catch { return {} }
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Teacher'

  useEffect(() => {
    async function load() {
      try {
        const [cls] = await Promise.all([api.get('/classes')])
        if (cls?.length) {
          const [sts, mks, risk] = await Promise.all([
            api.get(`/students?class_id=${cls[0].id}`),
            api.get(`/marks?class_id=${cls[0].id}`),
            api.get(`/at-risk?class_id=${cls[0].id}`).catch(() => []),
          ])
          setStudents(sts ?? [])
          setMarks(mks ?? [])
          setAtRisk(risk ?? [])
        }
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  // Compute per-student averages
  const studentAvgs = students.map(s => {
    const sm = marks.filter(m => m.student_id === s.id)
    const avg = sm.length ? Math.round(sm.reduce((a, m) => a + (m.max_score > 0 ? (m.score / m.max_score) * 100 : 0), 0) / sm.length) : null
    return { ...s, avg, status: avg !== null ? getStatus(avg) : null }
  })

  const below60 = studentAvgs.filter(s => s.avg !== null && s.avg < 60).length
  const needsAttention = studentAvgs.filter(s => s.status === 'needs_attention').length

  function dismissRiskFlag(studentId) {
    const updated = { ...dismissedFlags, [studentId]: Date.now() }
    setDismissedFlags(updated)
    localStorage.setItem('dismissed_risk_flags', JSON.stringify(updated))
    setRiskPanel(null)
  }

  const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000
  const activeRisk = atRisk.filter(r => {
    const dismissed = dismissedFlags[r.student_id]
    return !dismissed || (Date.now() - dismissed > TWO_WEEKS)
  })
  const riskMap = Object.fromEntries(activeRisk.map(r => [r.student_id, r]))

  const QUICK_LINKS = [
    { to: '/teacher/marks', icon: '✏️', label: 'Mark Entry', desc: 'Enter subject-wise marks', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
    { to: '/teacher/summaries', icon: '✦', label: 'AI Summaries', desc: 'Review & approve reports', color: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50' },
    { to: '/teacher/voice', icon: '💬', label: 'Messages', desc: 'Voice & text to parents', color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50' },
    { to: '/teacher/sentiment', icon: '📊', label: 'Sentiment', desc: 'Communication tone analysis', color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
  ]

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-400">{greeting}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-0.5">{firstName} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={students.length || '—'} icon="👥" color="border-gray-100" loading={loading} />
          <StatCard label="Below 60%" value={below60 || '0'} icon="⚠️" color="border-amber-100" loading={loading} />
          <StatCard label="Needs Attention" value={needsAttention || '0'} icon="🔴" color="border-red-100" loading={loading} />
          <StatCard label="On Track" value={studentAvgs.filter(s => s.status === 'on_track' || s.status === 'excellent').length || '0'} icon="✅" color="border-emerald-100" loading={loading} />
        </div>

        {/* Quick links */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${l.color}`}>
              <span className="text-xl">{l.icon}</span>
              <p className="font-semibold text-gray-900 text-sm mt-2">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
            </Link>
          ))}
        </div>

        {/* At-risk banner */}
        {activeRisk.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">{activeRisk.length} student{activeRisk.length > 1 ? 's' : ''} flagged for attention</p>
              <p className="text-xs text-amber-600 mt-0.5">Click the coloured dot next to a student's name to view details.</p>
            </div>
          </div>
        )}

        {/* Risk detail panel */}
        {riskPanel && (
          <div className="mb-6 bg-white border border-red-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{riskPanel.full_name}</p>
                <p className={`text-xs font-medium mt-0.5 ${riskPanel.severity === 'at_risk' ? 'text-red-600' : 'text-amber-600'}`}>
                  {riskPanel.severity === 'at_risk' ? '🔴 At Risk' : '🟡 Monitor'}
                </p>
              </div>
              <button onClick={() => setRiskPanel(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{riskPanel.explanation}</p>
            <div className="flex gap-2 mt-4">
              <Link to="/teacher/voice" className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                💬 Message Parent
              </Link>
              <button
                onClick={() => dismissRiskFlag(riskPanel.student_id)}
                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dismiss for 2 weeks
              </button>
            </div>
          </div>
        )}

        {/* Student status table */}
        {students.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-700">Student Overview</h2>
              <button onClick={() => {
                const rows = [['Name', 'Roll No', 'Average', 'Status'], ...studentAvgs.map(s => [s.full_name, s.roll_number, s.avg !== null ? `${s.avg}%` : 'N/A', s.status ? STATUS[s.status].label : 'No marks'])]
                const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
                const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'students.csv'; a.click()
              }} className="text-xs font-semibold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-slate-400 hover:text-slate-600 transition-colors">
                ↓ Export CSV
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Roll No.</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Average</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i}>
                        <td className="px-5 py-3"><div className="skeleton h-4 w-32" /></td>
                        <td className="px-5 py-3 hidden sm:table-cell"><div className="skeleton h-4 w-16" /></td>
                        <td className="px-5 py-3"><div className="skeleton h-4 w-12" /></td>
                        <td className="px-5 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
                      </tr>
                    ))
                  ) : studentAvgs.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-12 text-center">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-gray-500 font-medium">No students found</p>
                      <p className="text-xs text-gray-400 mt-1">Students will appear here once added to your class</p>
                    </td></tr>
                  ) : (
                    studentAvgs.map((s, i) => {
                      const st = s.status ? STATUS[s.status] : null
                      return (
                        <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <span className="text-slate-600 text-xs font-bold">
                                  {s.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">{s.full_name}</span>
                              {riskMap[s.id] && (
                                <button
                                  onClick={() => setRiskPanel(riskPanel?.student_id === s.id ? null : riskMap[s.id])}
                                  title={riskMap[s.id].severity === 'at_risk' ? 'At Risk — click for details' : 'Monitor — click for details'}
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${riskMap[s.id].severity === 'at_risk' ? 'bg-red-500' : 'bg-amber-400'} hover:ring-2 hover:ring-offset-1 ${riskMap[s.id].severity === 'at_risk' ? 'hover:ring-red-300' : 'hover:ring-amber-300'} transition-all`}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">{s.roll_number}</td>
                          <td className="px-5 py-3 font-semibold text-gray-700">{s.avg !== null ? `${s.avg}%` : '—'}</td>
                          <td className="px-5 py-3">
                            {st ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                            ) : <span className="text-gray-300 text-xs">No marks</span>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty state when no students loaded and not loading */}
        {!loading && students.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center mt-4">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-800 text-lg">No class assigned yet</h3>
            <p className="text-sm text-gray-400 mt-1">Contact your admin to be assigned to a class</p>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
