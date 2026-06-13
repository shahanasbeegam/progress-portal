import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import TeacherDashboard from './pages/teacher/Dashboard.jsx'
import MarkEntry from './pages/teacher/MarkEntry.jsx'
import Summaries from './pages/teacher/Summaries.jsx'
import ParentDashboard from './pages/parent/Dashboard.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import StudentDashboard from './pages/student/Dashboard.jsx'

function TeacherGuard({ children }) {
  return <ProtectedRoute allowedRoles={['teacher', 'admin']}>{children}</ProtectedRoute>
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
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherGuard><TeacherDashboard /></TeacherGuard>} />
        <Route path="/teacher/marks" element={<TeacherGuard><MarkEntry /></TeacherGuard>} />
        <Route path="/teacher/summaries" element={<TeacherGuard><Summaries /></TeacherGuard>} />

        {/* Parent routes */}
        <Route
          path="/parent/*"
          element={<ProtectedRoute allowedRoles={['parent', 'admin']}><ParentDashboard /></ProtectedRoute>}
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />

        {/* Student routes */}
        <Route
          path="/student/*"
          element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentDashboard /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
