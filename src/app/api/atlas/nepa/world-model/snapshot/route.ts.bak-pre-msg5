import { NextResponse } from 'next/server';
import { envelope, jitter } from '@/lib/nepa';
import { inferFrameSafe } from '@/lib/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Module-level ring buffer for prediction error history
const predErrHistory: number[] = [];

export async function GET() {
  const t = Date.now();
  const result = await inferFrameSafe(Buffer.alloc(0), { source: 'world-model-snapshot', region: 'FULL' });
  const wm = result.world_model;

  // Occupancy grid: 12x12, base noise + anomaly cluster if anomaly_flag
  const grid: number[][] = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => {
      const base = jitter(0.02, 0.08);
      if (wm.anomaly_flag && r >= 4 && r <= 7 && c >= 4 && c <= 7) {
        return Math.min(1, base + jitter(0.4, 0.7));
      }
      return base;
    })
  );

  // Prediction error history: push current value, keep last 60
  predErrHistory.push(wm.prediction_error);
  if (predErrHistory.length > 60) predErrHistory.shift();

  // Latent projection: 8 named clusters
  const latentProjection = [
    { x: jitter(-0.8, -0.3), y: jitter(-0.4, 0.1), label: 'patrol_pattern' },
    { x: jitter(0.2, 0.7), y: jitter(-0.6, -0.1), label: 'hovering' },
    { x: jitter(-0.5, 0.0), y: jitter(0.3, 0.8), label: 'approach_vector' },
    { x: jitter(0.5, 0.9), y: jitter(0.4, 0.9), label: 'swarm_coord' },
    { x: jitter(-0.9, -0.5), y: jitter(-0.9, -0.5), label: 'ground_loiter' },
    { x: jitter(0.1, 0.4), y: jitter(-0.9, -0.4), label: 'fast_transit' },
    { x: jitter(-0.3, 0.2), y: jitter(0.0, 0.4), label: 'formation_hold' },
    { x: jitter(0.6, 1.0), y: jitter(-0.2, 0.3), label: 'anomaly_cluster' },
  ];

  return NextResponse.json(envelope({
    ...wm,
    occupancy_grid: grid,
    pred_err_history: [...predErrHistory],
    latent_projection: latentProjection,
    ts: t,
  }, t));
}