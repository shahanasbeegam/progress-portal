import Navbar from '../../components/layout/Navbar.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function StudentDashboard() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {profile?.full_name ?? 'Student'}
        </h2>
        <p className="text-gray-500 text-sm mb-8">Student Dashboard</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DashCard title="My Progress" description="View your marks and AI progress summary" href="/student/progress" />
          <DashCard title="Charts" description="See your performance trends" href="/student/charts" />
        </div>
      </main>
    </div>
  )
}

function DashCard({ title, description, href }) {
  return (
    <a
      href={href}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </a>
  )
}
