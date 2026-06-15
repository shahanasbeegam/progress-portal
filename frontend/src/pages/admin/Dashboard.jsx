import { useState, useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { supabase } from '../../lib/supabase.js'
import { api } from '../../lib/api.js'

const ROLE_COLOR = {
  admin: 'bg-violet-100 text-violet-700',
  teacher: 'bg-blue-100 text-blue-700',
  parent: 'bg-emerald-100 text-emerald-700',
  student: 'bg-amber-100 text-amber-700',
}

function Spinner() {
  return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>
}

function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Sidebar>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="sentiment" element={<AdminSentiment />} />
      </Routes>
    </Sidebar>
  )
}

function AdminHome() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ teachers: 0, parents: 0, students: 0, admins: 0 })
  const [loading, setLoading] = useState(true)
  const [termSummary, setTermSummary] = useState(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryModal, setSummaryModal] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('role')
      .then(({ data }) => {
        if (data) {
          const counts = data.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc }, {})
          setStats(counts)
        }
      })
      .finally(() => setLoading(false))
    const saved = localStorage.getItem('term_summary')
    if (saved) setTermSummary(JSON.parse(saved))
  }, [])

  async function generateTermSummary() {
    setGeneratingSummary(true)
    try {
      const result = await api.post('/admin/term-summary', {})
      setTermSummary(result)
      localStorage.setItem('term_summary', JSON.stringify(result))
      setSummaryModal(true)
    } catch (e) {
      alert('Failed to generate: ' + e.message)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  const STAT_CARDS = [
    { label: 'Teachers', value: stats.teacher ?? 0, icon: '👨‍🏫', color: 'border-blue-100 bg-blue-50' },
    { label: 'Students', value: stats.student ?? 0, icon: '👦', color: 'border-amber-100 bg-amber-50' },
    { label: 'Parents', value: stats.parent ?? 0, icon: '👨‍👩‍👦', color: 'border-emerald-100 bg-emerald-50' },
    { label: 'Total Users', value: Object.values(stats).reduce((a,b) => a+b, 0), icon: '👥', color: 'border-violet-100 bg-violet-50' },
  ]

  const SECTIONS = [
    { to: 'users', icon: '👥', label: 'User Management', desc: 'View and manage all teachers, parents, students', color: 'hover:border-blue-300' },
    { to: 'classes', icon: '🏫', label: 'Classes', desc: 'Class configuration and section management', color: 'hover:border-violet-300' },
    { to: 'sentiment', icon: '📊', label: 'Sentiment Analytics', desc: 'Communication tone across the school', color: 'hover:border-emerald-300' },
  ]

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">School Administration</p>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* School-wide stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            {loading ? (
              <div className="space-y-2"><div className="skeleton h-8 w-12" /><div className="skeleton h-3 w-20" /></div>
            ) : (
              <>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* AI Term Summary */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 text-sm">✦ AI Term Summary Report</p>
          <p className="text-xs text-gray-500 mt-0.5">Generate a school-wide performance summary for the board. Max 300 words.</p>
          {termSummary && <p className="text-xs text-gray-400 mt-1">Last generated: {new Date(termSummary.generatedAt).toLocaleDateString('en-IN')}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          {termSummary && (
            <button onClick={() => setSummaryModal(true)} className="text-xs border border-violet-300 text-violet-700 px-3 py-2 rounded-lg hover:bg-violet-100 transition-colors">
              View
            </button>
          )}
          <button
            onClick={generateTermSummary}
            disabled={generatingSummary}
            className="text-xs bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
          >
            {generatingSummary ? 'Generating…' : termSummary ? 'Regenerate' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Term Summary Modal */}
      {summaryModal && termSummary && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSummaryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Term Performance Summary</h3>
              <button onClick={() => setSummaryModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{termSummary.summary}</p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => navigator.clipboard.writeText(termSummary.summary).then(() => alert('Copied!'))}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📋 Copy
              </button>
              <button onClick={() => setSummaryModal(false)} className="text-xs border border-gray-200 text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Manage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SECTIONS.map(s => (
          <Link key={s.to} to={s.to}
            className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all ${s.color}`}>
            <span className="text-2xl">{s.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-3 mb-1">{s.label}</h3>
            <p className="text-xs text-gray-400">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, role, created_at').order('role')
      .then(({ data }) => setUsers(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter)
  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc }, {})

  function exportCSV() {
    const rows = [['Name', 'Role', 'Joined'], ...filtered.map(u => [u.full_name, u.role, new Date(u.created_at).toLocaleDateString('en-IN')])]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'edubridge_users.csv'
    a.click()
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-2">
        <Link to="/admin" className="text-xs text-gray-400 hover:text-primary-500 transition-colors">← Dashboard</Link>
      </div>
      <PageTitle title="Users" subtitle={`${users.length} total accounts across all roles`} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'admin', 'teacher', 'parent', 'student'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === r ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-slate-400'
              }`}>
              {r.charAt(0).toUpperCase() + r.slice(1)} ({r === 'all' ? users.length : counts[r] ?? 0})
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:border-slate-400 hover:text-slate-700 transition-colors">
          ↓ Export CSV
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-2">👥</div>
          <p className="font-semibold text-gray-600">No users found</p>
          <p className="text-xs text-gray-400 mt-1">No {filter !== 'all' ? filter : ''} accounts yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u, i) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-slate-600 text-xs font-bold">
                          {u.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('classes').select('id, name, grade, section').order('name')
      .then(({ data }) => setClasses(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-2"><Link to="/admin" className="text-xs text-gray-400 hover:text-primary-500">← Dashboard</Link></div>
      <PageTitle title="Classes" subtitle={`${classes.length} classes configured`} />
      {loading ? <Spinner /> : classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-2">🏫</div>
          <p className="font-semibold text-gray-600">No classes yet</p>
          <p className="text-xs text-gray-400 mt-1">Contact your system administrator to add classes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-violet-200 transition-colors">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg mb-3">🏫</div>
              <h3 className="font-bold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-400 mt-1">Grade {c.grade} · Section {c.section}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminSentiment() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/sentiment')
      .then(data => setNotes(data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const counts = notes.reduce((acc, n) => { acc[n.sentiment] = (acc[n.sentiment] ?? 0) + 1; return acc }, {})
  const total = notes.length

  const SENTIMENTS = [
    { key: 'positive', label: 'Positive', emoji: '😊', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', bar: 'bg-emerald-500' },
    { key: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', bar: 'bg-gray-400' },
    { key: 'negative', label: 'Negative', emoji: '😟', color: 'text-red-600', bg: 'bg-red-50 border-red-100', bar: 'bg-red-500' },
  ]

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-2"><Link to="/admin" className="text-xs text-gray-400 hover:text-primary-500">← Dashboard</Link></div>
      <PageTitle title="Sentiment Analytics" subtitle="AI-classified tone analysis across all parent-teacher messages" />
      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}
      {loading ? <Spinner /> : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {SENTIMENTS.map(s => {
              const count = counts[s.key] ?? 0
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={s.key} className={`rounded-xl border p-5 text-center ${s.bg}`}>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className={`text-3xl font-extrabold ${s.color}`}>{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{s.label}</p>
                  <div className="mt-3 bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">All Messages</h3>
              <span className="text-xs text-gray-400">{total} total</span>
            </div>
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">💬</div>
                <p className="font-semibold text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Sentiment data will appear once teachers and parents start messaging</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notes.map((n, i) => (
                  <div key={i} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      n.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                      n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{n.sentiment}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">"{n.transcript}"</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.sender?.full_name} · {new Date(n.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
