import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useState } from 'react'

const NAV_ITEMS = {
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: '⊞', exact: true },
    { to: '/teacher/marks', label: 'Mark Entry', icon: '✏️' },
    { to: '/teacher/summaries', label: 'AI Summaries', icon: '✦' },
    { to: '/teacher/voice', label: 'Messages', icon: '💬' },
    { to: '/teacher/sentiment', label: 'Sentiment', icon: '📊' },
  ],
  parent: [
    { to: '/parent', label: 'Dashboard', icon: '⊞', exact: true },
    { to: '/parent/progress', label: 'Progress Report', icon: '📋' },
    { to: '/parent/charts', label: 'Performance', icon: '📈' },
    { to: '/parent/voice', label: 'Messages', icon: '💬' },
    { to: '/parent/progress-card', label: 'Progress Card', icon: '📄' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '⊞', exact: true },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/classes', label: 'Classes', icon: '🏫' },
    { to: '/admin/sentiment', label: 'Sentiment', icon: '📊' },
  ],
}

const ROLE_BADGE = {
  teacher: 'bg-blue-500/20 text-blue-200',
  parent: 'bg-emerald-500/20 text-emerald-200',
  admin: 'bg-violet-500/20 text-violet-200',
}

export default function Sidebar({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [signing, setSigning] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = NAV_ITEMS[profile?.role] ?? []
  const initials = profile?.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? 'U'

  function isActive(item) {
    return item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  }

  async function handleSignOut() {
    setSigning(true)
    try { await signOut() } catch (_) {}
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-parchment">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-slate-900 flex flex-col z-30 transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">EduBridge</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                ${isActive(item)
                  ? 'text-white bg-white/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-primary-500 before:rounded-r'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center shrink-0">
              <span className="text-primary-200 text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile?.full_name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_BADGE[profile?.role] ?? 'bg-gray-500/20 text-gray-300'}`}>
                {profile?.role}
              </span>
            </div>
          </div>
          <button onClick={handleSignOut} disabled={signing}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
            {signing ? 'Signing out…' : '↩ Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-slate-900 h-12 flex items-center justify-center px-4">
        <span className="text-white font-bold text-sm">EduBridge</span>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 min-h-screen pt-12 lg:pt-0 pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-white/10 flex">
        {navItems.slice(0, 4).map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors
              ${isActive(item) ? 'text-primary-400' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span className="truncate max-w-[56px] text-center leading-tight">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
