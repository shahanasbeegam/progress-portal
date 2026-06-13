import { useAuth } from '../../hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'

const ROLE_LABELS = {
  teacher: 'Teacher',
  parent: 'Parent',
  admin: 'Admin',
  student: 'Student',
}

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out failed:', err.message)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">PT</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm sm:text-base">
          Parent-Teacher Portal
        </span>
      </div>

      {profile && (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-500">
            {profile.full_name}
          </span>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
