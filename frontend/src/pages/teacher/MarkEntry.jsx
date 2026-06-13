import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import StudentMarkForm from '../../components/teacher/StudentMarkForm.jsx'
import { api } from '../../lib/api.js'

export default function MarkEntry() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/classes').then(setClasses).catch((e) => setError(e.message))
  }, [])

  async function handleClassChange(classId) {
    setSelectedClass(classId)
    setSelectedStudent('')
    setStudents([])
    setSubjects([])
    if (!classId) return
    try {
      const [s, sub] = await Promise.all([
        api.get(`/students?class_id=${classId}`),
        api.get(`/subjects?class_id=${classId}`),
      ])
      setStudents(s)
      setSubjects(sub)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/teacher')} className="text-sm text-primary-600 hover:underline mb-4 inline-block">
          ← Back to dashboard
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Marks</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {students.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedStudent && subjects.length > 0 && (
          <StudentMarkForm
            studentId={selectedStudent}
            subjects={subjects}
            onSaved={() => setError('')}
            onError={setError}
          />
        )}

        {selectedClass && students.length === 0 && !loading && (
          <p className="text-sm text-gray-500">No students found in this class.</p>
        )}
        {selectedClass && subjects.length === 0 && !loading && (
          <p className="text-sm text-gray-500">No subjects found for this class.</p>
        )}
      </main>
    </div>
  )
}
