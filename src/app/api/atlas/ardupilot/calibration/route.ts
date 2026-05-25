import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { mintHmacToken } from '@/src/lib/hmac'
import { CalibrationSensor, SensorCalibrationState, CalibrationStepId } from '@/src/types/ardupilot'

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const now = () => new Date().toISOString()

const calibrationState = new Map<CalibrationSensor, SensorCalibrationState>([
  ['accelerometer', { sensor:'accelerometer', step:'idle', step_index:0, total_steps:8,
    confidence:0.94, offsets:{x:0.012,y:-0.008,z:0.003},
    temperature_c:28.4, last_calibrated: new Date(Date.now()-86400000*3).toISOString() }],
  ['gyroscope',    { sensor:'gyroscope', step:'idle', step_index:0, total_steps:2,
    confidence:0.98, offsets:{x:0.001,y:0.002,z:-0.001},
    temperature_c:28.4, last_calibrated: new Date(Date.now()-86400000*3).toISOString() }],
  ['compass',      { sensor:'compass', step:'idle', step_index:0, total_steps:10,
    confidence:0.71, offsets:{x:12.4,y:-8.1,z:3.2},
    temperature_c:28.4, last_calibrated: new Date(Date.now()-86400000*14).toISOString() }],
  ['esc',          { sensor:'esc', step:'idle', step_index:0, total_steps:4,
    confidence:0.89, last_calibrated: new Date(Date.now()-86400000*30).toISOString() }],
  ['level',        { sensor:'level', step:'idle', step_index:0, total_steps:1,
    confidence:0.99, last_calibrated: new Date(Date.now()-86400000*3).toISOString() }],
])

const STEP_LADDERS: Record<CalibrationSensor, CalibrationStepId[]> = {
  accelerometer: [
    'pre_check','position_flat','position_left','position_right',
    'position_nose_down','position_nose_up','position_back','collecting','computing','commit','complete'
  ],
  gyroscope: ['pre_check','collecting','computing','commit','complete'],
  compass: ['pre_check','collecting','collecting','collecting','collecting','collecting','collecting','collecting','collecting','collecting','computing','commit','complete'],
  esc: ['pre_check','collecting','computing','commit','complete'],
  level: ['pre_check','collecting','commit','complete'],
}

export async function GET() {
  return NextResponse.json(envelope({ sensors: Object.fromEntries(calibrationState) }))
}

export async function POST(req: Request) {
  const body = await req.json()
  const { sensor, action, operator_id } = body
  if (!sensor || !action || !operator_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!calibrationState.has(sensor)) return NextResponse.json({ error: 'Invalid sensor' }, { status: 400 })
  let state = calibrationState.get(sensor)!
  let audit_id = Math.random().toString(36).slice(2,10)
  let hmac_token: string | undefined
  if (action === 'start') {
    state = { ...state, step: 'pre_check', step_index: 1 }
  } else if (action === 'advance') {
    const ladder = STEP_LADDERS[sensor]
    let idx = Math.min(state.step_index + 1, ladder.length - 1)
    let step = ladder[idx]
    let confidence = Math.min(1, state.confidence + jitter(0.02, 0.08))
    state = { ...state, step, step_index: idx, confidence }
  } else if (action === 'commit') {
    state = { ...state, step: 'complete', last_calibrated: now(), audit_id }
    hmac_token = mintHmacToken({ sensor, operator_id, ts: now() })
  } else if (action === 'abort') {
    state = { ...state, step: 'idle', step_index: 0 }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  calibrationState.set(sensor, state)
  return NextResponse.json(envelope({ ...state, audit_id, hmac_token }))
}