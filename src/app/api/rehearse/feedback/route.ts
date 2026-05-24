import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FEEDBACK_SYSTEM = `You are an experienced HK nursing interview coach. The candidate has psychiatric & community rehab background from Hospital Authority.
Score 5 axes (0-10): clinical_reasoning, communication, safety_awareness, cultural_competence, structure.
Reply strict JSON: {"scores":{"clinical_reasoning":n,"communication":n,"safety_awareness":n,"cultural_competence":n,"structure":n},"strengths":["a","b","c"],"improvements":["a","b","c"],"verdict":"...","next_question_id":"psych-XX"}.`

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const { sessionId, transcript, prompt, metrics } = await req.json()
  if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 })

  let feedback: any
  const key = process.env.OPENROUTER_API_KEY
  if (key) {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.aurasensehk.com',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: FEEDBACK_SYSTEM },
          { role: 'user', content: `Question: ${prompt}\n\nTranscript: ${transcript}\n\nNon-verbal metrics: ${JSON.stringify(metrics ?? {})}` },
        ],
      }),
    })
    const j = await r.json()
    try { feedback = JSON.parse(j.choices?.[0]?.message?.content ?? '{}') }
    catch { feedback = { error: 'parse failed', raw: j } }
  } else {
    feedback = {
      scores: { clinical_reasoning: 7, communication: 8, safety_awareness: 6, cultural_competence: 7, structure: 7 },
      strengths: ['Clear opening', 'Used SBAR structure', 'Empathetic tone'],
      improvements: ['Reference MHO 136 explicitly', 'Quantify suicide risk', 'Close with handover plan'],
      verdict: 'Strong baseline — sharpen legal framing and risk quantification.',
      next_question_id: 'psych-02',
      mock: true,
    }
  }

  if (sessionId) {
    await supabase.from('rehearse_sessions')
      .update({ ai_feedback: feedback })
      .eq('id', sessionId)
      .eq('user_id', user.id)
  }
  return NextResponse.json(feedback)
}
