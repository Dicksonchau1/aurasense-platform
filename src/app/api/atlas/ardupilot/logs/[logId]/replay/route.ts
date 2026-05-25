import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { LogReplayFrame, ArduPilotFlightMode } from '@/src/types/ardupilot'

function generateFrame(logId: string, ts_ms: number): LogReplayFrame {
  const seed = ts_ms * 0.001
  return {
    ts_ms,
    attitude: {
      roll:  Math.sin(seed * 0.3) * 8,
      pitch: Math.cos(seed * 0.2) * 6,
      yaw:   (seed * 15) % 360,
    },
    position: {
      lat: 22.3093 + Math.sin(seed * 0.05) * 0.005,
      lng: 114.2261 + Math.cos(seed * 0.04) * 0.005,
      alt_m: 60 + Math.sin(seed * 0.1) * 20,
    },
    velocity: {
      vx: Math.sin(seed * 0.6) * 8,
      vy: Math.cos(seed * 0.5) * 8,
      vz: Math.sin(seed * 1.2) * 2,
    },
    battery: {
      voltage: 22.4 - (ts_ms / 1000000),
      current: 8.2 + Math.sin(seed) * 2,
      remaining_pct: Math.max(0, 100 - (ts_ms / 1000000) * 10),
    },
    mode: 'LOITER' as ArduPilotFlightMode,
    rc_inputs: [1500, 1500, 1500, 1500, 1165, 1165],
    anomaly_flag: logId === 'log-2041' && ts_ms > 800000 && ts_ms < 820000,
    anomaly_class: logId === 'log-2041' && ts_ms > 800000 && ts_ms < 820000 ? 'UAV_SWARM' : undefined,
  }
}

export async function GET(req: Request, { params, url }: any) {
  const logId = params.logId
  const u = new URL(url)
  const ts_ms = Number(u.searchParams.get('ts_ms') ?? '0')
  const window_ms = Number(u.searchParams.get('window_ms') ?? '5000')
  const frames: LogReplayFrame[] = []
  for (let t = ts_ms; t < ts_ms + window_ms; t += 100) {
    frames.push(generateFrame(logId, t))
  }
  return NextResponse.json(envelope({ frames, log_id: logId, window_start: ts_ms, window_end: ts_ms + window_ms }))
}