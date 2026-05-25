import { NextRequest, NextResponse } from 'next/server';
import { envelope, nowISO } from '@/lib/nepa';
import { appendAudit } from '@/lib/audit-chain';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const available_modes = [
  'STABILIZE','ALT_HOLD','LOITER','AUTO','GUIDED','RTL','LAND','POSHOLD','BRAKE','SMART_RTL'
];
let currentMode = 'LOITER';

export async function GET() {
  const t = Date.now();
  return NextResponse.json(envelope({
    current_mode: currentMode,
    available_modes,
  }, t));
}

export async function POST(req: NextRequest) {
  const t = Date.now();
  const body = await req.json();
  const schema = z.object({ mode: z.string() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { mode } = parsed.data;
  if (!available_modes.includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }
  const previous_mode = currentMode;
  currentMode = mode;
  await appendAudit({ pipeline: 'ardupilot_mode_change', previous_mode, new_mode: mode, ts: nowISO() });
  return NextResponse.json(envelope({ ok: true, previous_mode, new_mode: mode }, t));
}