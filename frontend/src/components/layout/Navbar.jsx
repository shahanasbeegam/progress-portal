import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const ROLE_COLOR = {
  teacher: 'bg-blue-100 text-blue-700',
  parent: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-violet-100 text-violet-700',
  student: 'bg-amber-100 text-amber-700',
}

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try { await signOut() } catch (_) {}
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? 'U'

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-0 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">EduBridge</span>
        </Link>

        {profile && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLOR[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
            </span>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 text-xs font-bold">{initials}</span>
              </div>
              <span className="text-sm text-gray-700 font-medium max-w-[140px] truncate">{profile.full_name}</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
