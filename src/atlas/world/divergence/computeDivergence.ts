import { supabase } from '@/lib/supabase';
import type { DroneState } from '../types';
import type { Rollout } from '../nepa/client';

export function euclidean(a: DroneState['pose'], b: DroneState['pose']): number {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
}

export async function recordDivergence(opts: {
  promotionId: string;
  rollout: Rollout;
  actualStates: DroneState[];
  replayStates?: DroneState[];
}) {
  const rows = opts.rollout.states.map((pred, i) => {
    const actual  = opts.actualStates[i];
    const replay  = opts.replayStates?.[i];
    return {
      mission_promotion_id: opts.promotionId,
      step: i,
      predicted_pose: pred.pose,
      actual_pose: actual?.pose ?? null,
      replay_pose: replay?.pose ?? null,
      pos_error_m:         actual ? +euclidean(pred.pose, actual.pose).toFixed(4) : null,
      replay_pos_error_m:  (actual && replay) ? +euclidean(actual.pose, replay.pose).toFixed(4) : null,
      model_confidence: 1 - (opts.rollout.uncertainty[i] ?? 0),
    };
  });

  const { error } = await supabase.from('trajectory_divergences').insert(rows);
  if (error) throw error;
}
