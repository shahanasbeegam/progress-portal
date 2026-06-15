import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateFeedbackSuggestions({ subject, score, maxScore, classLevel }) {
  const pct = Math.round((score / maxScore) * 100)
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `A student in ${classLevel || 'school'} scored ${pct}% in ${subject}. Give exactly 3 short, actionable feedback suggestions a teacher can attach to this grade. Each must be one sentence, specific to ${subject}, and tell the student what to DO — not just "study more". Format as JSON array of strings. Nothing else.`,
    }],
  })
  try {
    const text = msg.content[0].text.trim()
    const match = text.match(/\[[\s\S]*\]/)
    return JSON.parse(match ? match[0] : text)
  } catch {
    return ['Review the key concepts covered in this topic.', 'Practice with additional exercises from your textbook.', 'Ask your teacher for extra help during free periods.']
  }
}

export async function generateAtRiskExplanation(signals) {
  const signalText = signals.join('; ')
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,
    messages: [{
      role: 'user',
      content: `Write exactly 2 sentences describing what the data shows about a student. Data: ${signalText}. Do NOT use the word "risk", do NOT predict outcomes, do NOT make judgements. Only describe what has happened factually.`,
    }],
  })
  return msg.content[0].text.trim()
}

export async function generateTermSummary(schoolData) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Write a formal school term performance summary (max 300 words, suitable for a school board) based on this data:

${JSON.stringify(schoolData, null, 2)}

Structure: 1 opening sentence overall picture, then cover: grade trends vs last term, attendance trend, how many students flagged for support, best and weakest performing classes/subjects, teacher submission timeliness. Honest about problems but constructive. Plain formal English.`,
    }],
  })
  return msg.content[0].text.trim()
}

export async function generateParentPlainSummary(marks) {
  const subjectLines = marks.map(m => `${m.subject}: ${Math.round((m.score / m.max_score) * 100)}%`).join(', ')
  const avg = marks.length ? Math.round(marks.reduce((a, m) => a + (m.score / m.max_score) * 100, 0) / marks.length) : 0
  const weak = marks.filter(m => (m.score / m.max_score) * 100 < 65).map(m => m.subject)
  const strong = marks.filter(m => (m.score / m.max_score) * 100 >= 75).map(m => m.subject)

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Write a warm, honest 3-paragraph parent update (max 150 words) about a student's school performance. Refer to the student as "your child" — never use a name.

Data: average ${avg}%, subjects: ${subjectLines}
Strong subjects (≥75%): ${strong.join(', ') || 'none yet'}
Subjects needing attention (<65%): ${weak.join(', ') || 'none'}

Paragraph 1: overall assessment (honest, not hollow).
Paragraph 2: what they are doing well.
Paragraph 3: where they need more focus.
No percentages in the text. No hollow phrases like "doing amazingly". Warm but real.`,
    }],
  })
  return msg.content[0].text.trim()
}

export async function generateStudySuggestions({ subject, pct, classLevel }) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `A ${classLevel || 'school'} student is struggling in ${subject} (scoring ${pct}%). Give exactly 3 practical things a parent (not a subject expert) can do at home to help. Each suggestion must be one sentence, specific to ${subject}, and actionable — not "encourage your child to study more". No paid tutoring. Format as JSON array of strings. Nothing else.`,
    }],
  })
  try {
    const text = msg.content[0].text.trim()
    const match = text.match(/\[[\s\S]*\]/)
    return JSON.parse(match ? match[0] : text)
  } catch {
    return [
      `Ask your child to explain one ${subject} concept they learned this week in simple words.`,
      `Review their ${subject} notes together for 10 minutes each evening.`,
      `Look for free ${subject} practice worksheets online for their grade level.`,
    ]
  }
}

export async function checkMessageTone(message) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are checking if a teacher's message to a parent has a harsh, blaming, or defensive tone.

Message: "${message}"

Check for: absolutes ("never", "always", "constantly"), blaming language ("you need to make sure"), dismissive phrases ("doesn't seem to care"), frustrated language ("I've told him repeatedly").

If the tone is fine (honest and direct is fine), respond with JSON: {"ok": true}
If the tone is problematic, respond with JSON: {"ok": false, "suggestion": "rewritten version that preserves meaning but softens language"}

Respond ONLY with JSON. Nothing else. Only flag genuinely harsh messages — not direct honest ones.`,
    }],
  })
  try {
    const text = msg.content[0].text.trim()
    const match = text.match(/\{[\s\S]*\}/)
    return JSON.parse(match ? match[0] : text)
  } catch {
    return { ok: true }
  }
}

export async function generateProgressSummary({ studentName, className, term, marks, tone = 'warm' }) {
  const markLines = marks
    .map((m) => `  - ${m.subject}: ${m.score}/${m.max_score} (${m.exam_type})`)
    .join('\n')

  const toneGuide = {
    warm: 'encouraging, warm, empathetic — celebrate effort alongside achievement',
    formal: 'professional and measured — factual with formal language suitable for records',
    concise: 'brief and direct — bullet-point style thinking in compact prose, no filler phrases',
  }[tone] || 'warm'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `You are a school progress report assistant. Write a ${tone} progress summary in 2–3 short paragraphs. Tone: ${toneGuide}.

Student: ${studentName}
Class: ${className}
Term: ${term}

Marks:
${markLines}

Guidelines:
- Paragraph 1: Overall performance overview
- Paragraph 2: Subject highlights — mention strengths and 1–2 areas to improve
- Paragraph 3: Brief closing with a practical suggestion for parents

Keep it under 180 words. Plain English, no jargon. Do not use generic phrases like "a pleasure to teach" or "always tries their best" — be specific to this student's actual data.`,
      },
    ],
  })

  return message.content[0].text
}
