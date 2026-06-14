import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const CARDS = [
  { to: '/parent/progress', icon: '📊', title: 'Progress Report', desc: 'View your child\'s marks and AI-written summary', color: 'bg-blue-50 border-blue-100 hover:border-blue-300', icon_bg: 'bg-blue-100' },
  { to: '/parent/charts', icon: '📈', title: 'Performance Charts', desc: 'Subject-wise charts and performance trends', color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300', icon_bg: 'bg-emerald-100' },
  { to: '/parent/voice', icon: '💬', title: 'Messages', desc: 'Send or receive voice notes and text messages from teacher', color: 'bg-violet-50 border-violet-100 hover:border-violet-300', icon_bg: 'bg-violet-100' },
  { to: '/parent/progress-card', icon: '📄', title: 'Progress Card', desc: 'Download your child\'s digitally signed PDF report card', color: 'bg-amber-50 border-amber-100 hover:border-amber-300', icon_bg: 'bg-amber-100' },
]

export default function ParentDashboard() {
  const { profile } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ').slice(-1)[0] ?? 'Parent'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-1">{greeting}</p>
          <h1 className="text-3xl font-bold text-gray-900">{firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Stay informed about your child's progress and communicate with the teacher.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to}
              className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${c.color}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${c.icon_bg} group-hover:scale-110 transition-transform`}>
                {c.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{c.desc}</p>
              </div>
              <span className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors text-lg self-center">›</span>
            </Link>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-emerald-500 text-lg shrink-0">✅</span>
          <p className="text-sm text-emerald-700">
            <strong>Remember:</strong> After reading the progress report, tap "I have seen this report" to let the teacher know you've reviewed it.
          </p>
        </div>
      </main>
    </div>
  )
}
