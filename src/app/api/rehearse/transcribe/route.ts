import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json({ text: '[transcription disabled — set OPENAI_API_KEY]', mock: true })
  }
  const form = await req.formData()
  const file = form.get('audio') as File | null
  if (!file) return NextResponse.json({ error: 'audio file required' }, { status: 400 })

  const upstream = new FormData()
  upstream.append('file', file, 'speech.webm')
  upstream.append('model', 'whisper-1')
  upstream.append('language', 'en')

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}` },
    body: upstream,
  })
  const j = await r.json()
  return NextResponse.json({ text: j.text ?? '', raw: j })
}
