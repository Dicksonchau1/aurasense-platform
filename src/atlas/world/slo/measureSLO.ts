import { supabase } from '@/lib/supabase';
import { SKILL_SLOS } from './skillSLOs';
import type { Scores } from '../nepa/client';

export async function measureMissionSLOs(opts: {
  siteId: string;
  missionId: string;
  sessionId: string;
  skillId: string;
  skillVersion: string;
  scores: Scores;
}) {
  const defs = SKILL_SLOS[opts.skillId];
  if (!defs?.length) return;

  const rows = defs.map(def => {
    const v = opts.scores[def.metric as keyof Scores] as number;
    return {
      skill_id:      opts.skillId,
      skill_version: opts.skillVersion,
      slo_name:      def.sloName,
      site_id:       opts.siteId,
      mission_id:    opts.missionId,
      session_id:    opts.sessionId,
      measured_value: +v.toFixed(4),
      slo_met:       v >= def.sloTarget,
      sla_met:       v >= def.slaFloor,
    };
  });

  const { data, error } = await supabase
    .from('skill_slo_measurements')
    .insert(rows)
    .select('id, sla_met, slo_name, measured_value, skill_id');
  if (error) throw error;

  // Issue credits for SLA breaches
  for (const row of data) {
    if (!row.sla_met) await issueSLOCredit({ ...opts, measurementId: row.id, skillId: row.skill_id });
  }
}

async function issueSLOCredit(opts: {
  siteId: string;
  skillId: string;
  measurementId: number;
}) {
  const def = SKILL_SLOS[opts.skillId]?.[0];
  if (!def) return;
  const { data: sub } = await supabase
    .from('subscriptions').select('monthly_hkd').eq('site_id', opts.siteId).single();
  const creditAmount = (sub?.monthly_hkd ?? 2200) * (def.creditPct / 100);
  await supabase.from('slo_credits').insert({
    site_id: opts.siteId,
    skill_id: opts.skillId,
    breach_measurement_id: opts.measurementId,
    credit_pct: def.creditPct,
    credit_amount_hkd: +creditAmount.toFixed(2),
    period_start: new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10),
    period_end:   new Date().toISOString().slice(0,10),
  });
}