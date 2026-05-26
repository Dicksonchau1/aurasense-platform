import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAllTracks, advanceThreatState } from '@/lib/atlas/threat-store'

const bodySchema = z.object({
  to: z.string(),
  operator_id: z.string()
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const json = await req.json()
  const result = bodySchema.safeParse(json)
  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'validation_error', issues: result.error.flatten() }, { status: 400 })
  }
  try {
    advanceThreatState(id, result.data.to, result.data.operator_id, result.data.operator_id)
    const track = getAllTracks().find(t => t.id === id)
    return NextResponse.json({ ok: true, track })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 })
  }
}
