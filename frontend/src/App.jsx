import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Unauthorized from './pages/Unauthorized.jsx'

import TeacherDashboard from './pages/teacher/Dashboard.jsx'
import MarkEntry from './pages/teacher/MarkEntry.jsx'
import Summaries from './pages/teacher/Summaries.jsx'
import TeacherVoiceNotes from './pages/teacher/VoiceNotes.jsx'
import SentimentDashboard from './pages/teacher/SentimentDashboard.jsx'

import ParentDashboard from './pages/parent/Dashboard.jsx'
import ParentProgress from './pages/parent/Progress.jsx'
import ParentCharts from './pages/parent/Charts.jsx'
import ProgressCard from './pages/parent/ProgressCard.jsx'
import ParentVoiceNotes from './pages/parent/VoiceNotes.jsx'

import AdminDashboard from './pages/admin/Dashboard.jsx'
import StudentDashboard from './pages/student/Dashboard.jsx'

function Guard({ roles, children }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
}

function RoleRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  const routes = { teacher: '/teacher', parent: '/parent', admin: '/admin', student: '/student' }
  return <Navigate to={routes[profile.role] ?? '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/home" element={<RoleRedirect />} />

        {/* Teacher */}
        <Route path="/teacher" element={<Guard roles={['teacher','admin']}><TeacherDashboard /></Guard>} />
        <Route path="/teacher/marks" element={<Guard roles={['teacher','admin']}><MarkEntry /></Guard>} />
        <Route path="/teacher/summaries" element={<Guard roles={['teacher','admin']}><Summaries /></Guard>} />
        <Route path="/teacher/voice" element={<Guard roles={['teacher','admin']}><TeacherVoiceNotes /></Guard>} />
        <Route path="/teacher/sentiment" element={<Guard roles={['teacher','admin']}><SentimentDashboard /></Guard>} />

        {/* Parent */}
        <Route path="/parent" element={<Guard roles={['parent','admin']}><ParentDashboard /></Guard>} />
        <Route path="/parent/progress" element={<Guard roles={['parent','admin']}><ParentProgress /></Guard>} />
        <Route path="/parent/charts" element={<Guard roles={['parent','admin']}><ParentCharts /></Guard>} />
        <Route path="/parent/progress-card" element={<Guard roles={['parent','admin']}><ProgressCard /></Guard>} />
        <Route path="/parent/voice" element={<Guard roles={['parent','admin']}><ParentVoiceNotes /></Guard>} />

        {/* Admin */}
        <Route path="/admin/*" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />

        {/* Student */}
        <Route path="/student/*" element={<Guard roles={['student','admin']}><StudentDashboard /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
