import { NextResponse } from 'next/server';
import { envelope, jitter, nowISO } from '@/lib/nepa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const t = Date.now();
  const status = {
    link_status: 'connected',
    signal_strength: Math.round(jitter(85, 98)),
    heartbeat_hz: Number(jitter(0.9, 1.1).toFixed(2)),
    last_heartbeat: nowISO(),
    vehicle_type: 'MULTIROTOR',
    autopilot_type: 'ArduPilot',
    firmware_version: 'ArduCopter-4.5.1',
    system_status: 'ACTIVE',
    custom_mode: 13,
    flight_mode: 'LOITER',
    armed: false,
    ts: nowISO(),
  };
  return NextResponse.json(envelope(status, t));
}