import { Link } from 'react-router-dom'

const STATS = [
  { value: '90+', label: 'Students Enrolled' },
  { value: '3', label: 'Classes (8, 9 & 10)' },
  { value: 'AI', label: 'Powered Summaries' },
  { value: '100%', label: 'Free for Schools' },
]

const FEATURES = [
  { icon: '📊', title: 'Live Mark Tracking', desc: 'Subject-wise marks for Q1, Q2 & Annual visible to parents the moment a teacher enters them.' },
  { icon: '🤖', title: 'AI Progress Reports', desc: 'Claude AI turns raw marks into a personalised, easy-to-read progress summary for every student.' },
  { icon: '💬', title: 'Voice & Text Messaging', desc: 'Teachers and parents exchange voice notes or typed messages — no app downloads needed.' },
  { icon: '😊', title: 'Sentiment Analysis', desc: 'Every message is automatically classified as positive, neutral, or negative for admin oversight.' },
  { icon: '✅', title: 'Parent Acknowledgement', desc: 'Parents tap "I have seen this" on the report. Teachers see a confirmation badge instantly.' },
  { icon: '📄', title: 'Signed PDF Progress Cards', desc: 'Download a cryptographically signed PDF report card — tamper-proof and always available.' },
]

const COMING_SOON = [
  { icon: '📅', title: 'Attendance Tracking', desc: 'Daily attendance with instant SMS alerts to parents for absences.' },
  { icon: '📚', title: 'Homework Board', desc: 'Teachers post assignments. Parents track if their child has submitted.' },
  { icon: '🗓️', title: 'Exam Timetable', desc: 'Upcoming exam schedule visible to students and parents at all times.' },
  { icon: '📢', title: 'School Notice Board', desc: 'Circulars, event updates, and announcements pushed to all parents.' },
  { icon: '✉️', title: 'Leave Applications', desc: 'Parents apply for leave online. Teacher approves with one tap.' },
  { icon: '🤝', title: 'PTM Scheduler', desc: 'Book parent-teacher meeting slots online — no queues, no confusion.' },
]

const PERSONAS = [
  {
    emoji: '👨‍🏫',
    role: 'Class Teacher',
    color: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50 border-blue-100',
    tag: 'bg-blue-100 text-blue-700',
    points: ['Enter marks per subject & exam', 'Generate AI progress summaries', 'Approve & send reports to parents', 'Message parents via voice or text', 'See who has acknowledged the report'],
  },
  {
    emoji: '👨‍👩‍👦',
    role: 'Parent',
    color: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50 border-emerald-100',
    tag: 'bg-emerald-100 text-emerald-700',
    points: ['View child\'s marks anytime', 'Read AI-written progress summary', 'Acknowledge you\'ve seen the report', 'Reply to teacher via voice or text', 'Download a signed PDF report card'],
  },
  {
    emoji: '🏫',
    role: 'School Admin',
    color: 'from-violet-500 to-violet-600',
    light: 'bg-violet-50 border-violet-100',
    tag: 'bg-violet-100 text-violet-700',
    points: ['Manage classes, teachers & students', 'Monitor all communications', 'View school-wide sentiment dashboard', 'Track parent engagement rate', 'Ensure no student is left unreviewed'],
  },
]

const PROBLEMS = [
  { problem: 'Parents only find out about poor performance on report day — too late to act.', fix: 'Live marks visible to parents as soon as the teacher enters them.' },
  { problem: 'Progress reports are full of jargon parents don\'t understand.', fix: 'Claude AI rewrites marks into a simple, warm progress letter.' },
  { problem: 'Teacher-parent communication is stuck in diaries and missed calls.', fix: 'Voice notes and messages exchanged digitally, instantly, on any device.' },
  { problem: 'Schools have no way to confirm parents actually read the reports.', fix: 'One-tap acknowledgement — teachers see confirmed vs pending at a glance.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-lg font-bold tracking-tight">EduBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how" className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 transition-colors">How it works</a>
            <Link to="/login" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white px-6 py-24 text-center">
        {/* subtle grid bg */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1 rounded-full mb-6 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · CBSE Schools · Classes 8, 9 & 10
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            The school portal that keeps<br />
            <span className="text-primary-300">parents always in the loop</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            EduBridge connects teachers and parents through AI-powered progress reports,
            real-time mark tracking, and direct voice or text messaging — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-7 py-3 rounded-xl transition-colors text-sm shadow-lg">
              Sign In to Your Portal →
            </Link>
            <a href="#features" className="border border-white/30 text-white hover:bg-white/10 font-medium px-7 py-3 rounded-xl transition-colors text-sm">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-primary-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem → Solution ─────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">The Problem</span>
          <h2 className="text-3xl font-bold mt-2">School communication is broken</h2>
          <p className="text-gray-500 mt-2 text-sm">Here's what EduBridge fixes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROBLEMS.map((item, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex gap-2 items-start mb-3">
                <span className="text-red-400 text-lg shrink-0">✗</span>
                <p className="text-sm text-gray-600 leading-snug">{item.problem}</p>
              </div>
              <div className="flex gap-2 items-start bg-emerald-50 rounded-xl px-3 py-2">
                <span className="text-emerald-500 text-lg shrink-0">✓</span>
                <p className="text-sm text-emerald-800 font-medium leading-snug">{item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who is it for ──────────────────────────────────────── */}
      <section id="how" className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Roles</span>
            <h2 className="text-3xl font-bold mt-2">One platform, three experiences</h2>
            <p className="text-gray-500 text-sm mt-2">Every user gets a personalised dashboard built for their role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONAS.map((p) => (
              <div key={p.role} className={`rounded-2xl border ${p.light} overflow-hidden`}>
                <div className={`bg-gradient-to-r ${p.color} px-6 py-5 text-white`}>
                  <div className="text-3xl mb-2">{p.emoji}</div>
                  <span className="text-sm font-bold">{p.role}</span>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {p.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl font-bold mt-2">Everything your school needs today</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary-200 hover:shadow-lg transition-all cursor-default">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-primary-100 transition-colors">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coming Soon ────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20 px-6 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-4">Coming Soon</span>
            <h2 className="text-3xl font-bold">What we're building next</h2>
            <p className="text-white/50 text-sm mt-2">Planned features to make EduBridge a complete school management platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMING_SOON.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold mb-3">Your school is already set up</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Sign in with the credentials provided by your school admin.
            Teachers, parents, and admin each get their own dashboard.
          </p>
          <Link to="/login" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-9 py-3.5 rounded-xl transition-colors shadow-lg text-sm">
            Sign In to EduBridge →
          </Link>
          <p className="text-xs text-gray-400 mt-4">Demo password: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">School@1234</span></p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-semibold text-sm text-gray-700">EduBridge</span>
          </div>
          <p className="text-xs text-gray-400 text-center">AI-powered parent-teacher communication for CBSE schools · Powered by Claude AI</p>
          <Link to="/login" className="text-xs text-primary-600 hover:underline">Sign In →</Link>
        </div>
      </footer>

    </div>
  )
}
