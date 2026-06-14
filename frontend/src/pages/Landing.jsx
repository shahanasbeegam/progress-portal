import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📝',
    title: 'Mark Entry by Teachers',
    desc: 'Class teachers enter subject-wise marks for Q1, Q2, and Annual exams. All 5 CBSE subjects tracked in one place.',
  },
  {
    icon: '🤖',
    title: 'AI Progress Summaries',
    desc: 'Claude AI reads the marks and writes a plain-English progress report for each student. Teacher reviews it before sending to parents.',
  },
  {
    icon: '🎙️',
    title: 'Voice & Text Messages',
    desc: 'Teachers send voice notes or typed messages to parents. Parents reply the same way — no apps to install, no phone tag.',
  },
  {
    icon: '😊',
    title: 'Sentiment Analysis',
    desc: 'Every message is automatically labelled positive, neutral, or negative. Admin gets a school-wide view of parent-teacher tone.',
  },
  {
    icon: '✅',
    title: 'Parent Acknowledgement',
    desc: 'After reading the AI summary, parents tap "I have seen this report." Teachers see a confirmed badge — no more uncertainty.',
  },
  {
    icon: '📄',
    title: 'Signed PDF Progress Cards',
    desc: 'Parents download a digitally signed PDF of their child\'s report card — tamper-proof, shareable, and always available.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            For CBSE Schools · Classes 8, 9 & 10
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            A smarter way for<br />
            <span className="text-primary-600">parents and teachers</span><br />
            to stay connected
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-3">
            EduBridge is a school communication portal where teachers share student progress,
            parents receive AI-written summaries, and both sides exchange voice or text messages —
            all in one secure platform.
          </p>
          <p className="text-gray-400 text-sm mb-10">
            No more physical diaries. No missed calls. No guesswork about how your child is doing.
          </p>
          <Link to="/login"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
            Sign In to Your School Portal →
          </Link>
        </div>
      </section>

      {/* Who is this for */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Who uses EduBridge?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: '👨‍🏫',
              role: 'Class Teachers',
              color: 'border-blue-200 bg-blue-50',
              badge: 'bg-blue-100 text-blue-700',
              points: [
                'Enter marks for all subjects and exams',
                'Generate AI-written progress summaries',
                'Approve and publish reports to parents',
                'Send voice notes or messages to parents',
                'See which parents have acknowledged',
              ],
            },
            {
              emoji: '👨‍👩‍👦',
              role: 'Parents',
              color: 'border-green-200 bg-green-50',
              badge: 'bg-green-100 text-green-700',
              points: [
                'View your child\'s marks for every subject',
                'Read AI-generated progress summary',
                'Download a signed PDF progress card',
                'Send voice or typed messages to teacher',
                'Acknowledge you have seen the report',
              ],
            },
            {
              emoji: '🏫',
              role: 'School Admin',
              color: 'border-purple-200 bg-purple-50',
              badge: 'bg-purple-100 text-purple-700',
              points: [
                'Manage classes, teachers, and students',
                'Monitor all parent-teacher messages',
                'View school-wide sentiment overview',
                'Track parent engagement at a glance',
                'Ensure no student is left unreviewed',
              ],
            },
          ].map((r) => (
            <div key={r.role} className={`rounded-2xl border ${r.color} p-6`}>
              <div className="text-3xl mb-2">{r.emoji}</div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${r.badge}`}>{r.role}</span>
              <ul className="space-y-2">
                {r.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-primary-500 mt-0.5 shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">The problem we solve</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { problem: 'Parents don\'t know how their child is performing until report day', solution: 'Live marks visible anytime, per subject and per exam' },
              { problem: 'Progress reports are hard to understand for non-academic parents', solution: 'Claude AI rewrites marks into simple plain-English summaries' },
              { problem: 'Teacher-parent communication relies on physical diaries or calls', solution: 'Voice notes and typed messages exchanged digitally, instantly' },
              { problem: 'Schools don\'t know if parents actually read the progress report', solution: 'One-tap acknowledgement — teacher sees who has confirmed' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-red-600 mb-3">❌ {item.problem}</p>
                <p className="text-sm text-green-700 font-medium">✅ {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">What's inside</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Every feature your school needs, nothing it doesn't.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Your school is already set up</h2>
        <p className="text-primary-100 text-sm mb-8 max-w-md mx-auto">
          Sign in with the credentials provided by your school administrator.
          Teachers, parents, and admin each have their own personalised dashboard.
        </p>
        <Link to="/login"
          className="inline-block bg-white text-primary-600 hover:bg-primary-50 font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
          Sign In to EduBridge →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-gray-700 text-sm">EduBridge</span>
        </div>
        <p className="text-xs text-gray-400">AI-powered parent-teacher communication for CBSE schools · Powered by Claude AI</p>
      </footer>

    </div>
  )
}
