import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import { api } from '../../lib/api.js'
import { supabase } from '../../lib/supabase.js'

const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Annual']

export default function ProgressCard() {
  const [child, setChild] = useState(null)
  const [term, setTerm] = useState('Term 1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/parent/child').then(setChild).catch((e) => setError(e.message))
  }, [])

  async function handleDownload() {
    if (!child) return
    setError('')
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/progress-card/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ student_id: child.id, term }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `progress-card-${child.full_name}-${term}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <Link to="/parent" className="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Download Progress Card</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {child && (
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-semibold text-gray-800">{child.full_name} · {child.classes?.name}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || !child}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Generating PDF…' : 'Download Signed PDF'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            PDF includes an HMAC-SHA256 digital signature for authenticity verification.
          </p>
        </div>
      </main>
    </div>
  )
}
