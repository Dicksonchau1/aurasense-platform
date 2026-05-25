import { NextResponse } from 'next/server';
import { envelope } from '@/lib/nepa';
import { inferFrameSafe } from '@/lib/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Module-level ring buffer for spike rate history
const spikeRateHistory: number[] = [];

export async function GET() {
  const t = Date.now();
  const result = await inferFrameSafe(Buffer.alloc(0), { source: 'stdp-snapshot', region: 'FULL' });
  const stdp = result.stdp;
  spikeRateHistory.push(stdp.spike_rate_hz);
  if (spikeRateHistory.length > 60) spikeRateHistory.shift();
  return NextResponse.json(envelope({ ...stdp, ts: t, spike_rate_history: [...spikeRateHistory] }, t));
}