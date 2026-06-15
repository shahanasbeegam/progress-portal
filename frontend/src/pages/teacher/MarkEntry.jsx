import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from '../../components/layout/Sidebar.jsx'
import StudentMarkForm from '../../components/teacher/StudentMarkForm.jsx'
import { api } from '../../lib/api.js'

export default function MarkEntry() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')

  useEffect(() => {
    api.get('/classes').then(setClasses).catch((e) => toast.error(e.message))
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
      toast.error(e.message)
    }
  }

  const selectedStudentName = students.find((s) => s.id === selectedStudent)?.full_name

  return (
    <Sidebar>
      <div className="px-6 py-8 max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/teacher" className="hover:text-primary-600 transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-gray-600 font-medium">Mark Entry</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📝</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter Marks</h1>
            <p className="text-sm text-gray-400">Select a class and student to enter marks</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
            >
              <option value="">— Choose a class —</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {students.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              >
                <option value="">— Choose a student —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
              </select>
            </div>
          )}

          {selectedClass && students.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No students found in this class.</p>
          )}
        </div>

        {/* Mark Form */}
        {selectedStudent && subjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 text-xs font-bold">
                  {selectedStudentName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedStudentName}</p>
                <p className="text-xs text-gray-400">{subjects.length} subjects</p>
              </div>
            </div>
            <StudentMarkForm
              studentId={selectedStudent}
              subjects={subjects}
              onSaved={() => toast.success('Marks saved successfully!')}
              onError={(e) => toast.error(e)}
            />
          </div>
        )}
      </div>
    </Sidebar>
  )
}
