import { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { supabase } from '../../lib/supabase.js'

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
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {profile?.full_name ?? 'Admin'}</h2>
      <p className="text-gray-500 text-sm mb-8">Admin Dashboard</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashCard title="Users" description="View all teachers, parents and students" to="users" />
        <DashCard title="Classes" description="View class and subject assignments" to="classes" />
        <DashCard title="Sentiment Overview" description="View sentiment across all voice notes" to="sentiment" />
      </div>
    </main>
  )
}

function DashCard({ title, description, to }) {
  return (
    <Link to={to} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false })
      .then(({ data }) => setUsers(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const ROLE_COLOR = { admin: 'bg-purple-100 text-purple-700', teacher: 'bg-blue-100 text-blue-700', parent: 'bg-green-100 text-green-700', student: 'bg-yellow-100 text-yellow-700' }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Users</h2>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
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
      <Link to="/admin" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Classes</h2>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Grade</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Section</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.grade}</td>
                  <td className="px-4 py-3 text-gray-600">{c.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function AdminSentiment() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('voice_notes').select('sentiment, transcript, created_at, sender:sender_id(full_name)')
      .not('sentiment', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const counts = notes.reduce((acc, n) => { acc[n.sentiment] = (acc[n.sentiment] ?? 0) + 1; return acc }, {})

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sentiment Overview</h2>
      {loading ? <Spinner /> : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[['positive', 'text-green-600', 'bg-green-50'], ['neutral', 'text-gray-600', 'bg-gray-50'], ['negative', 'text-red-600', 'bg-red-50']].map(([s, tc, bg]) => (
              <div key={s} className={`${bg} rounded-xl border border-gray-200 p-4 text-center`}>
                <p className={`text-3xl font-bold ${tc}`}>{counts[s] ?? 0}</p>
                <p className="text-sm text-gray-500 capitalize mt-1">{s}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">All Sentiment Records</h3>
            {notes.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No sentiment data yet.</p> : (
              <div className="space-y-3">
                {notes.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm border-b border-gray-100 pb-3 last:border-0">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{n.sentiment}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-600 italic truncate">"{n.transcript}"</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.sender?.full_name} · {new Date(n.created_at).toLocaleDateString()}</p>
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

function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
}
