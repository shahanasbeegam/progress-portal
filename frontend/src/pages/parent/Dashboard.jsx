import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { api } from '../../lib/api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function getStatusLabel(avg) {
  if (avg >= 80) return { label: 'Doing Well', color: 'text-emerald-600 bg-emerald-50', arrow: '↑' }
  if (avg >= 60) return { label: 'On Track', color: 'text-blue-600 bg-blue-50', arrow: '→' }
  if (avg >= 40) return { label: 'Needs Support', color: 'text-amber-600 bg-amber-50', arrow: '↓' }
  return { label: 'At Risk', color: 'text-red-600 bg-red-50', arrow: '↓↓' }
}

function getSubjectColor(pct) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 65) return 'bg-blue-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function ParentDashboard() {
  const { profile } = useAuth()
  const [child, setChild] = useState(null)
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [plainSummary, setPlainSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function load() {
      try {
        const c = await api.get('/parent/child')
        setChild(c)
        if (c) {
          const m = await api.get(`/marks?student_id=${c.id}`)
          setMarks(m ?? [])
          // Load plain-language summary
          setSummaryLoading(true)
          api.get(`/parent/plain-summary?student_id=${c.id}`)
            .then(r => setPlainSummary(r))
            .catch(() => {})
            .finally(() => setSummaryLoading(false))
        }
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const overall = marks.length
    ? Math.round(marks.reduce((a, m) => a + (m.max_score > 0 ? (m.score / m.max_score) * 100 : 0), 0) / marks.length)
    : null

  // Subject averages
  const subjectMap = {}
  marks.forEach(m => {
    const name = m.subjects?.name ?? 'Unknown'
    if (!subjectMap[name]) subjectMap[name] = { total: 0, count: 0 }
    if (m.max_score > 0) {
      subjectMap[name].total += (m.score / m.max_score) * 100
      subjectMap[name].count++
    }
  })
  const subjects = Object.entries(subjectMap).map(([name, d]) => ({
    name, avg: Math.round(d.total / d.count)
  })).sort((a, b) => b.avg - a.avg)

  // Build trend data: one point per exam_type, value = avg % across subjects
  const examTypes = [...new Set(marks.map(m => m.exam_type))].filter(Boolean)
  const subjectNames = [...new Set(marks.map(m => m.subjects?.name).filter(Boolean))]
  const SUBJECT_COLORS = ['#0EA5B0', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
  const trendData = examTypes.map(et => {
    const point = { exam: et.charAt(0).toUpperCase() + et.slice(1) }
    subjectNames.forEach(sn => {
      const m = marks.find(mk => mk.exam_type === et && mk.subjects?.name === sn)
      if (m && m.max_score > 0) point[sn] = Math.round((m.score / m.max_score) * 100)
    })
    return point
  })

  const status = overall !== null ? getStatusLabel(overall) : null
  const childInitials = child?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() ?? '?'

  const LINKS = [
    { to: '/parent/progress', icon: '📋', label: 'Progress Report', desc: 'AI summary & marks detail' },
    { to: '/parent/charts', icon: '📈', label: 'Performance Charts', desc: 'Visual trends over time' },
    { to: '/parent/voice', icon: '💬', label: 'Message Teacher', desc: 'Send voice or text note' },
    { to: '/parent/progress-card', icon: '📄', label: 'Progress Card', desc: 'Download signed PDF' },
  ]

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Greeting */}
        <p className="text-sm text-gray-400 mb-6">{greeting}, {profile?.full_name?.split(' ')[0]}</p>

        {/* Child hero banner */}
        {loading ? (
          <div className="bg-slate-900 rounded-2xl p-6 mb-6">
            <div className="skeleton h-6 w-48 mb-2" style={{background:'rgba(255,255,255,0.15)'}} />
            <div className="skeleton h-12 w-32" style={{background:'rgba(255,255,255,0.1)'}} />
          </div>
        ) : child ? (
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/30 flex items-center justify-center shrink-0">
                <span className="text-primary-200 text-xl font-bold">{childInitials}</span>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Your Child</p>
                <h1 className="text-2xl font-bold">{child.full_name}</h1>
                <p className="text-slate-400 text-sm">{child.classes?.name ?? 'Class not assigned'} · Roll #{child.roll_number}</p>
              </div>
              {overall !== null && (
                <div className="text-right shrink-0">
                  <p className="text-5xl font-bold">{overall}%</p>
                  <p className="text-slate-400 text-xs mt-0.5">Overall Average</p>
                  {status && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${status.color}`}>
                      {status.arrow} {status.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-6">
            <div className="text-4xl mb-2">👶</div>
            <p className="font-semibold text-gray-700">No child linked to your account</p>
            <p className="text-sm text-gray-400 mt-1">Please contact the school admin</p>
          </div>
        )}

        {/* Plain-language AI summary card */}
        {child && (summaryLoading || plainSummary?.summary) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">✦ How is your child doing?</p>
              {plainSummary?.updatedAt && (
                <p className="text-xs text-gray-400">Updated {new Date(plainSummary.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              )}
            </div>
            {summaryLoading ? (
              <div className="space-y-2">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-5/6 rounded" />
                <div className="skeleton h-3 w-4/6 rounded" />
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{plainSummary?.summary}</p>
            )}
          </div>
        )}

        {/* Subject breakdown */}
        {subjects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Subject Performance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.map(s => (
                <div key={s.name} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1 truncate">{s.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.avg}%</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getSubjectColor(s.avg)}`} style={{width:`${s.avg}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade Trend Chart */}
        {trendData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Grade Trend</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="exam" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {subjectNames.map((sn, i) => (
                    <Line key={sn} type="monotone" dataKey={sn} stroke={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick links */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-300 hover:shadow-sm transition-all group">
              <span className="text-xl">{l.icon}</span>
              <p className="font-semibold text-gray-900 text-sm mt-2">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
            </Link>
          ))}
        </div>

        {/* Sticky message teacher button */}
        <div className="fixed bottom-6 right-6 lg:right-8 z-20">
          <Link to="/parent/voice"
            className="flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-primary-600 transition-colors">
            <span>💬</span> Message Teacher
          </Link>
        </div>
      </div>
    </Sidebar>
  )
}
