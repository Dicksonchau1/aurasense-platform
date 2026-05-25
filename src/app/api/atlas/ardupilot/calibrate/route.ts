import { NextRequest, NextResponse } from 'next/server';
import { envelope, nowISO } from '@/lib/nepa';
import { appendAudit } from '@/lib/audit-chain';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const validSubsystems = ['imu','compass','barometer','radio','all'] as const;
type Subsystem = typeof validSubsystems[number];

// Module-level calibration progress state
const calState: Map<Subsystem, { progress: number; status: string; last_calibrated_at?: string }> = new Map();

function getInitialStatus(subsystem: Subsystem) {
  if (subsystem === 'barometer' || subsystem === 'radio') return 'uncalibrated';
  return 'uncalibrated';
}

export async function POST(req: NextRequest) {
  const t = Date.now();
  const schema = z.object({ subsystem: z.enum(validSubsystems) });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { subsystem } = parsed.data;

  // Handle 'all' as sequential calibration of all subsystems
  if (subsystem === 'all') {
    let maxProgress = 0;
    for (const s of validSubsystems) {
      if (s === 'all') continue;
      const state = calState.get(s) || { progress: 0, status: getInitialStatus(s) };
      if (state.progress < 100) {
        state.progress = Math.min(100, state.progress + 25);
        state.status = state.progress === 100 ? 'calibrated' : 'in_progress';
        if (state.progress === 100) state.last_calibrated_at = nowISO();
        calState.set(s, state);
      }
      if (state.progress > maxProgress) maxProgress = state.progress;
    }
    await appendAudit({ pipeline: 'ardupilot_calibration', subsystem: 'all', ts: nowISO() });
    return NextResponse.json(envelope({ ok: true, status: maxProgress === 100 ? 'calibrated' : 'in_progress', progress: maxProgress, subsystem: 'all' }, t));
  }

  // Per-subsystem calibration
  let state = calState.get(subsystem) || { progress: 0, status: getInitialStatus(subsystem) };
  if (state.progress < 100) {
    state.progress = Math.min(100, state.progress + 25);
    state.status = state.progress === 100 ? 'calibrated' : 'in_progress';
    if (state.progress === 100) state.last_calibrated_at = nowISO();
    calState.set(subsystem, state);
  }
  await appendAudit({ pipeline: 'ardupilot_calibration', subsystem, ts: nowISO() });
  return NextResponse.json(envelope({
    ok: true,
    status: state.status,
    progress: state.progress,
    subsystem,
    last_calibrated_at: state.last_calibrated_at,
  }, t));
}