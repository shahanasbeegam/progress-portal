import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const CARDS = [
  { to: '/teacher/marks', icon: '📝', title: 'Mark Entry', desc: 'Enter subject-wise marks for Q1, Q2 & Annual exams', color: 'bg-blue-50 border-blue-100 hover:border-blue-300', icon_bg: 'bg-blue-100' },
  { to: '/teacher/summaries', icon: '🤖', title: 'AI Summaries', desc: 'Review and approve AI-generated student progress reports', color: 'bg-violet-50 border-violet-100 hover:border-violet-300', icon_bg: 'bg-violet-100' },
  { to: '/teacher/voice', icon: '💬', title: 'Messages', desc: 'Send voice notes or text messages to parents', color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300', icon_bg: 'bg-emerald-100' },
  { to: '/teacher/sentiment', icon: '📊', title: 'Sentiment Dashboard', desc: 'Monitor parent communication tone and engagement', color: 'bg-amber-50 border-amber-100 hover:border-amber-300', icon_bg: 'bg-amber-100' },
]

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Teacher'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-1">{greeting}</p>
          <h1 className="text-3xl font-bold text-gray-900">{firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your teacher dashboard. What would you like to do today?</p>
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

        {/* Quick tip */}
        <div className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-primary-500 text-lg shrink-0">💡</span>
          <p className="text-sm text-primary-700">
            <strong>Tip:</strong> After entering marks, generate an AI summary for each student and approve it — parents will see it instantly on their dashboard.
          </p>
        </div>
      </main>
    </div>
  )
}
