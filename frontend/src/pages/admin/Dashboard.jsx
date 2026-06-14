import { useState, useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
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
  return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
}

function PageHeader({ title, subtitle, back }) {
  return (
    <div className="mb-8">
      <Link to={back ?? '/admin'} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors mb-4">
        ‹ Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="sentiment" element={<AdminSentiment />} />
      </Routes>
    </div>
  )
}

function AdminHome() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  const CARDS = [
    { to: 'users', icon: '👥', title: 'Users', desc: 'View all teachers, parents and students', color: 'bg-blue-50 border-blue-100 hover:border-blue-300', icon_bg: 'bg-blue-100' },
    { to: 'classes', icon: '🏫', title: 'Classes', desc: 'View class and subject assignments', color: 'bg-violet-50 border-violet-100 hover:border-violet-300', icon_bg: 'bg-violet-100' },
    { to: 'sentiment', icon: '📊', title: 'Sentiment Overview', desc: 'Monitor parent-teacher communication tone', color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300', icon_bg: 'bg-emerald-100' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your school, monitor communication and track engagement.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to}
            className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:shadow-md ${c.color}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.icon_bg} group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-0.5">{c.title}</h3>
              <p className="text-xs text-gray-500 leading-snug">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
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

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter)
  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc }, {})

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="All Users" subtitle={`${users.length} total accounts`} />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'admin', 'teacher', 'parent', 'student'].map((r) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === r ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-primary-300'}`}>
            {r.charAt(0).toUpperCase() + r.slice(1)} {r !== 'all' ? `(${counts[r] ?? 0})` : `(${users.length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-primary-700 text-xs font-bold">
                          {u.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
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
    </main>
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Classes" subtitle={`${classes.length} classes configured`} />
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg mb-3">🏫</div>
              <h3 className="font-bold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-400 mt-1">Grade {c.grade} · Section {c.section}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

function AdminSentiment() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/sentiment')
      .then((data) => setNotes(data ?? []))
      .catch((e) => setError(e.message))
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Sentiment Overview" subtitle="Tone analysis across all parent-teacher messages" />
      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}
      {loading ? <Spinner /> : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {SENTIMENTS.map((s) => {
              const count = counts[s.key] ?? 0
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={s.key} className={`rounded-2xl border p-5 text-center ${s.bg}`}>
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

          {/* Message list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">All Messages</h3>
              <span className="text-xs text-gray-400">{total} total</span>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No sentiment data yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {notes.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
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
    </main>
  )
}
