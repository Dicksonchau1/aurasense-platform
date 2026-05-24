import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('rehearse_sessions')
    .insert({ user_id: user.id, specialty: body.specialty ?? 'psych', question_id: body.questionId ?? null })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const { data, error } = await supabase
    .from('rehearse_sessions')
    .select('id, started_at, ended_at, specialty, question_id, duration_ms, posture_avg, gaze_avg, envelope_avg, consistency_avg, ai_feedback')
    .eq('user_id', user.id).order('started_at', { ascending: false }).limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sessions: data ?? [] })
}
