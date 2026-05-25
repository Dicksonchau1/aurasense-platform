import { supabase } from '@/lib/supabase';

const DRIFT_THRESHOLD_PCT = 0.10;   // >10% steps drifting → flag for retraining
const DRIFT_ERROR_M       = 0.50;   // >50cm positional error = a drift step

export async function checkDriftAlert(promotionId: string, siteId: string) {
  const { data } = await supabase.from('trajectory_divergences')
    .select('pos_error_m').eq('mission_promotion_id', promotionId);
  if (!data?.length) return;

  const driftPct = data.filter(r => (r.pos_error_m ?? 0) > DRIFT_ERROR_M).length / data.length;

  if (driftPct > DRIFT_THRESHOLD_PCT) {
    await supabase.from('retraining_flags').insert({
      site_id: siteId,
      trigger: 'divergence_drift',
      drift_pct: +driftPct.toFixed(3),
      promotion_id: promotionId,
      flagged_at: new Date().toISOString(),
      status: 'pending',
    });
    // This row is consumed by the postflight Δ-distillation pipeline,
    // triggering a targeted NEPA head fine-tune — no manual action required.
  }
}
