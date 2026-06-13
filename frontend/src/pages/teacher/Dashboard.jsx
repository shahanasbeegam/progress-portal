import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function TeacherDashboard() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {profile?.full_name ?? 'Teacher'}
        </h2>
        <p className="text-gray-500 text-sm mb-8">Teacher Dashboard</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashCard title="Mark Entry" description="Enter and update student marks" to="/teacher/marks" />
          <DashCard title="AI Summaries" description="Review and approve AI-generated summaries" to="/teacher/summaries" />
          <DashCard title="Voice Notes" description="Send voice notes to parents or classes" to="/teacher/voice" />
          <DashCard title="Sentiment Dashboard" description="View parent sentiment trends from voice messages" to="/teacher/sentiment" />
        </div>
      </main>
    </div>
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
