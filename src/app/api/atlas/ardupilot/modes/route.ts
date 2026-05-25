import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { mintEdgeToken } from '@/src/lib/hmac'
import { FlightModeConfig, ModeSlot, ArduPilotFlightMode, ModeChangeRecord } from '@/src/types/ardupilot'

const MODE_LIST: ArduPilotFlightMode[] = [
  'STABILIZE','ACRO','ALT_HOLD','AUTO','GUIDED','LOITER','RTL','CIRCLE','LAND','DRIFT','SPORT','POSHOLD','BRAKE','THROW','SMART_RTL','FLOWHOLD','FOLLOW','ZIGZAG'
]

const modeSlots: FlightModeConfig[] = [
  { slot:1, mode:'STABILIZE', rc_pwm_min:1000, rc_pwm_max:1230, label:'CH5_LOW' },
  { slot:2, mode:'ALT_HOLD',  rc_pwm_min:1231, rc_pwm_max:1360, label:'CH5_MID1' },
  { slot:3, mode:'LOITER',    rc_pwm_min:1361, rc_pwm_max:1490, label:'CH5_MID2' },
  { slot:4, mode:'AUTO',      rc_pwm_min:1491, rc_pwm_max:1620, label:'CH5_MID3' },
  { slot:5, mode:'RTL',       rc_pwm_min:1621, rc_pwm_max:1749, label:'CH5_HIGH1' },
  { slot:6, mode:'LAND',      rc_pwm_min:1750, rc_pwm_max:2000, label:'CH5_HIGH2' },
]
let currentSlot: ModeSlot = 1
const modeHistory: ModeChangeRecord[] = []

export async function GET() {
  return NextResponse.json(envelope({ slots: modeSlots, current_slot: currentSlot, history: modeHistory.slice(-20) }))
}

export async function POST(req: Request) {
  const body = await req.json()
  const { slot, mode, operator_id } = body
  if (!slot || !mode || !operator_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!MODE_LIST.includes(mode)) return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  if (slot < 1 || slot > 6) return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
  const prev = modeSlots[slot-1].mode
  const token = mintEdgeToken({ userId: operator_id, plan:'enterprise', ttlSeconds:60 })
  const audit_id = Math.random().toString(36).slice(2,10)
  modeHistory.push({ slot, from_mode: prev, to_mode: mode, operator_id, hmac_token: token, audit_id, ts: new Date().toISOString() })
  modeSlots[slot-1].mode = mode
  currentSlot = slot
  return NextResponse.json(envelope({ ok:true, slot, mode, token, audit_id, slots: modeSlots, history: modeHistory.slice(-20) }))
}