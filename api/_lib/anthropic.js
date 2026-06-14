import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateProgressSummary({ studentName, className, term, marks }) {
  const markLines = marks
    .map((m) => `  - ${m.subject}: ${m.score}/${m.max_score} (${m.exam_type})`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `You are a school progress report assistant. Write a warm, professional, parent-friendly progress summary in 2–3 short paragraphs.

Student: ${studentName}
Class: ${className}
Term: ${term}

Marks:
${markLines}

Guidelines:
- Paragraph 1: Overall performance overview (positive, encouraging tone)
- Paragraph 2: Subject highlights — mention strengths and 1–2 areas to improve
- Paragraph 3: Brief encouraging closing with a practical suggestion for parents

Keep it under 180 words. Plain English, no jargon.`,
      },
    ],
  })

  return message.content[0].text
}
