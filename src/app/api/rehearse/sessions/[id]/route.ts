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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = await req.json()
  const patch = {
    ended_at: new Date().toISOString(),
    duration_ms: body.durationMs ?? null,
    posture_avg: body.postureAvg ?? null,
    framing_avg: body.framingAvg ?? null,
    gaze_avg: body.gazeAvg ?? null,
    envelope_avg: body.envelopeAvg ?? null,
    consistency_avg: body.consistencyAvg ?? null,
    transcript: body.transcript ?? null,
    recording_url: body.recordingUrl ?? null,
  }
  const { data, error } = await supabase
    .from('rehearse_sessions').update(patch)
    .eq('id', id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const { data, error } = await supabase
    .from('rehearse_sessions').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
