import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { NermStatus, NermMode } from '@/src/types/ardupilot'

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min)
}

let nermMode: NermMode = 'STANDBY'
let nermState: NermStatus = {
  mode: 'STANDBY',
  codec: 'ultra_low_latency',
  inference_hz: 0,
  last_frame_ts: null,
  queue_depth: 0,
  drop_rate: 0,
  latency_p50_ms: 0,
  latency_p99_ms: 0,
  energy_uw: 850,
  spike_rate_hz: 0,
  plasticity_events: 0,
  adaptation_rate: 0.02,
}

export function activateNerm(): NermStatus {
  nermState = {
    ...nermState,
    mode: 'ACTIVE',
    codec: 'ultra_low_latency',
    inference_hz: jitter(280, 340),
    last_frame_ts: new Date().toISOString(),
    queue_depth: Math.round(jitter(0, 4)),
    drop_rate: jitter(0, 0.02),
    latency_p50_ms: jitter(1.2, 2.8),
    latency_p99_ms: jitter(4.0, 8.5),
    energy_uw: jitter(820, 920),
    spike_rate_hz: jitter(40, 120),
    plasticity_events: Math.round(jitter(800, 2400)),
    adaptation_rate: jitter(0.015, 0.035),
  }
  nermMode = 'ACTIVE'
  return nermState
}

export function setNermMode(mode: NermMode): NermStatus {
  nermMode = mode
  nermState = { ...nermState, mode }
  if (mode === 'ACTIVE') return activateNerm()
  if (mode === 'STANDBY') nermState = { ...nermState, inference_hz:0, queue_depth:0, spike_rate_hz:0 }
  if (mode === 'EMERGENCY') nermState = { ...nermState, codec:'ultra_low_latency', inference_hz:jitter(340,400), latency_p50_ms:jitter(0.8,1.5) }
  return nermState
}

export async function GET() {
  if (nermMode === 'ACTIVE') activateNerm()
  return NextResponse.json(envelope(nermState))
}