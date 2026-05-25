import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { NermMode } from '@/src/types/ardupilot'
import { setNermMode, nermState } from '../status/route'

const VALID_MODES: NermMode[] = ['STANDBY','ACTIVE','EMERGENCY','CALIBRATING','OFFLINE']

export async function POST(req: Request) {
  const body = await req.json()
  const { mode, operator_id } = body
  if (!mode || !operator_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!VALID_MODES.includes(mode)) return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  const previous_mode = nermState.mode
  const new_status = setNermMode(mode)
  const audit_id = Math.random().toString(36).slice(2,10)
  // Simulate audit pipeline append
  return NextResponse.json(envelope({ ok:true, previous_mode, new_mode: mode, status: new_status, audit_id }))
}