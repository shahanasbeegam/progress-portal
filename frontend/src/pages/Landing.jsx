import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📊',
    title: 'Real-Time Progress Tracking',
    desc: 'Teachers enter marks for every subject and exam. Parents instantly see their child\'s performance across Q1, Q2, and Annual exams.',
  },
  {
    icon: '🤖',
    title: 'AI-Generated Summaries',
    desc: 'Claude AI analyses marks and writes personalised progress summaries for each student. Teachers review and approve before parents see them.',
  },
  {
    icon: '🎙️',
    title: 'Voice & Text Messaging',
    desc: 'Teachers and parents can exchange voice notes or typed messages directly. No need for phone calls or physical diary entries.',
  },
  {
    icon: '😊',
    title: 'Sentiment Analysis',
    desc: 'Every message is automatically analysed for tone — positive, neutral, or negative — giving the school a real-time pulse on parent engagement.',
  },
  {
    icon: '✅',
    title: 'Parent Acknowledgement',
    desc: 'Parents digitally confirm they have reviewed the progress report. Teachers see who has acknowledged and who hasn\'t.',
  },
  {
    icon: '📄',
    title: 'Digitally Signed PDF Cards',
    desc: 'Download a cryptographically signed PDF progress card — a tamper-proof record for every student, every term.',
  },
]

const HOW_IT_WORKS = [
  { role: 'Teacher', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', steps: ['Enter marks for each student', 'Generate AI progress summary', 'Approve and send to parents', 'Exchange voice or text messages'] },
  { role: 'Parent', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', steps: ['View child\'s progress report', 'Read AI-written summary', 'Acknowledge you have seen it', 'Send message to teacher'] },
  { role: 'Admin', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', steps: ['Manage classes and users', 'Monitor all communications', 'View school-wide sentiment', 'Track parent engagement'] },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">EduBridge</span>
        </div>
        <Link to="/login"
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          AI-Powered · CBSE Schools
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Bridging Parents &<br />Teachers with AI
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          EduBridge is a modern parent-teacher communication portal built for CBSE schools.
          Track student progress, exchange messages, and get AI-generated insights — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
            Get Started →
          </Link>
          <a href="#features"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-8 py-3 rounded-xl transition-colors text-sm">
            See Features
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[['3', 'Classes'], ['90+', 'Students'], ['AI', 'Powered']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-primary-600">{val}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Everything your school needs</h2>
          <p className="text-gray-500 text-center mb-12">Built for Indian CBSE schools. Designed for simplicity.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">How it works</h2>
        <p className="text-gray-500 text-center mb-12">Three roles. One seamless experience.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((r) => (
            <div key={r.role} className={`rounded-2xl border ${r.color} p-6`}>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${r.badge}`}>{r.role}</span>
              <ul className="space-y-3">
                {r.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to connect your school?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">Sign in with your school credentials to access your personalised dashboard.</p>
        <Link to="/login"
          className="bg-white text-primary-600 hover:bg-primary-50 font-semibold px-8 py-3 rounded-xl transition-colors text-sm inline-block">
          Sign In to EduBridge →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-gray-600">EduBridge</span>
        </div>
        <p>AI-powered parent-teacher communication for CBSE schools · Built with Claude AI</p>
      </footer>
    </div>
  )
}
