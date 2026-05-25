import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: customers } = await supabase.rpc('customer_health_cohort');
  let written = 0, alertsSent = 0;

  for (const row of customers ?? []) {
    const { data: health } = await supabase.rpc('compute_customer_health_score', {
      p_customer_id: row.customer_id,
    });

    await supabase.from('customer_health_snapshots').insert({
      customer_id: row.customer_id,
      score: health.score,
      band: health.band,
      components: health.components,
      signals: health.signals,
      monthly_revenue: health.context.monthly_revenue,
    });
    written++;

    // Detect band downgrades vs yesterday
    const { data: prev } = await supabase.from('customer_health_snapshots')
      .select('band').eq('customer_id', row.customer_id)
      .lt('snapshot_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
      .order('snapshot_at', { ascending: false }).limit(1);

    const prevBand = prev?.[0]?.band;
    const downgraded = (prevBand === 'healthy' && health.band !== 'healthy')
                    || (prevBand === 'at_risk' && health.band === 'critical');

    if (downgraded) {
      // Insert CSM alert
      await supabase.from('csm_alerts').insert({
        customer_id: row.customer_id,
        alert_type: 'band_downgrade',
        severity: health.band === 'critical' ? 'high' : 'medium',
        payload: { from: prevBand, to: health.band, score: health.score, signals: health.signals },
      });
      // Enqueue CSM alert email
      await supabase.from('email_queue').insert({
        to_customer: 'csm_team',
        to_email: process.env.CSM_TEAM_EMAIL,
        template: 'csm_alert',
        payload: {
          customer_id: row.customer_id,
          from_band: prevBand,
          to_band: health.band,
          score: health.score,
          signals: health.signals,
          drilldown_url: `${process.env.NEXT_PUBLIC_APP_URL}/account-manager?customer=${row.customer_id}`,
        },
        dedupe_key: `csm_alert_${row.customer_id}_${new Date().toISOString().slice(0,10)}`,
      });
      alertsSent++;
    }
  }

  return NextResponse.json({ ok: true, snapshotsWritten: written, alertsSent });
}
