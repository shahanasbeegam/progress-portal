import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const ROLE_REDIRECTS = {
  teacher: '/teacher',
  parent: '/parent',
  admin: '/admin',
  student: '/student',
}

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@school.com', color: 'bg-violet-50 border-violet-200 hover:border-violet-400', dot: 'bg-violet-500', text: 'text-violet-700' },
  { role: 'Teacher (8A)', email: 'teacher801@school.com', color: 'bg-blue-50 border-blue-200 hover:border-blue-400', dot: 'bg-blue-500', text: 'text-blue-700' },
  { role: 'Teacher (9A)', email: 'teacher901@school.com', color: 'bg-blue-50 border-blue-200 hover:border-blue-400', dot: 'bg-blue-500', text: 'text-blue-700' },
  { role: 'Teacher (10A)', email: 'teacher1001@school.com', color: 'bg-blue-50 border-blue-200 hover:border-blue-400', dot: 'bg-blue-500', text: 'text-blue-700' },
  { role: 'Parent (Class 8)', email: 'parent801@school.com', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { role: 'Parent (Class 9)', email: 'parent901@school.com', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', dot: 'bg-emerald-500', text: 'text-emerald-700' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail)
    setPassword('School@1234')
    setError('')
  }

  if (profile) {
    navigate(ROLE_REDIRECTS[profile.role] ?? '/', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* subtle dot grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Brand panel ── */}
        <div className="hidden lg:flex flex-col justify-center text-white w-80 shrink-0 py-8">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">EduBridge</span>
          </Link>
          <h1 className="text-3xl font-extrabold leading-tight mb-4">
            Your school,<br />connected.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Sign in to access your personalised dashboard — whether you're a teacher, parent, or school admin.
          </p>
          <div className="space-y-3">
            {[
              { icon: '📊', text: 'Live marks & AI progress reports' },
              { icon: '💬', text: 'Voice & text messaging' },
              { icon: '✅', text: 'Parent acknowledgement tracking' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="text-base">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login form + demo accounts ── */}
        <div className="flex-1 space-y-4">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-2">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <span className="font-bold text-lg">EduBridge</span>
            </Link>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-400 mt-1">Sign in with your school credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in →'}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
              Demo accounts · password: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">School@1234</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} onClick={() => fillDemo(a.email)}
                  className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 text-left transition-all bg-white ${a.color}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${a.dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${a.text}`}>{a.role}</p>
                    <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-white/40">
            <Link to="/" className="hover:text-white/70 transition-colors">← Back to EduBridge home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
