import Groq from 'groq-sdk'

let _client = null

export function getGroq() {
  if (!_client) {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('Missing env var: GROQ_API_KEY')
    _client = new Groq({ apiKey: key })
  }
  return _client
}
