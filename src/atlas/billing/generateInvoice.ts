import { supabase } from '@/lib/supabase';

export async function generateMonthlyInvoice(siteId: string, periodStart: Date) {
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const start = periodStart.toISOString();
  const end   = periodEnd.toISOString();

  const [sub, credits, overages, skills] = await Promise.all([
    supabase.from('subscriptions').select('monthly_hkd').eq('site_id', siteId).single(),
    supabase.from('slo_credits').select('credit_amount_hkd')
      .eq('site_id', siteId).eq('applied', false)
      .gte('issued_at', start).lt('issued_at', end),
    supabase.from('postflight_overages').select('amount_hkd')
      .eq('site_id', siteId).gte('created_at', start).lt('created_at', end),
    supabase.from('skill_purchases').select('amount_hkd')
      .eq('site_id', siteId).gte('purchased_at', start).lt('purchased_at', end),
  ]);

  const totalCredits = (credits.data ?? []).reduce((s,c) => s + c.credit_amount_hkd, 0);
  const totalOverages = (overages.data ?? []).reduce((s,o) => s + o.amount_hkd, 0);
  const totalSkills = (skills.data ?? []).reduce((s,sk) => s + sk.amount_hkd, 0);

  const { data: invoice, error } = await supabase.from('invoices').insert({
    site_id: siteId,
    period_start: start.slice(0,10),
    period_end: end.slice(0,10),
    subscription_hkd: sub.data?.monthly_hkd ?? 2200,
    slo_credits_hkd: +totalCredits.toFixed(2),
    postflight_overage_hkd: +totalOverages.toFixed(2),
    skills_hkd: +totalSkills.toFixed(2),
    activation_hkd: 0,
    status: 'draft',
  }).select('id').single();
  if (error) throw error;

  // Mark credits as applied
  await supabase.from('slo_credits').update({ applied: true })
    .eq('site_id', siteId).eq('applied', false)
    .gte('issued_at', start).lt('issued_at', end);

  return invoice;
}