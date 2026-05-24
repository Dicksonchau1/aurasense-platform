import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const specialty = req.nextUrl.searchParams.get('specialty') ?? 'psych'
  const { data, error } = await supabase
    .from('rehearse_questions')
    .select('id, specialty, prompt, difficulty, rubric')
    .eq('specialty', specialty)
    .eq('active', true)
    .order('difficulty', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ specialty, questions: data ?? [] })
}
