import { supabase } from '@/lib/supabase';

// Runs daily via cron — flags contracts with 30 days remaining
export async function scheduleRenewals() {
  const target = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const start = new Date(target); start.setHours(0,0,0,0);
  const end   = new Date(target); end.setHours(23,59,59,999);

  const { data: expiring } = await supabase.from('skill_contracts')
    .select('id, customer_id, site_id, skill_id, sla_tier')
    .eq('status', 'active')
    .neq('skill_id', '__bundle_master__')
    .gte('ends_at', start.toISOString())
    .lte('ends_at', end.toISOString());

  for (const c of expiring ?? []) {
    const { data: retro } = await supabase.rpc('compute_contract_retrospective', { p_contract_id: c.id });

    await supabase.from('renewal_offers').insert({
      contract_id: c.id,
      site_id: c.site_id,
      customer_id: c.customer_id,
      retrospective: retro,
      offer_type: retro.uptier_signal === 'none' ? 'renew_same' : 'uptier_suggested',
      suggested_tier: retro.suggested_tier,
      expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      status: 'pending',
    });

    await sendRenewalEmail(c.customer_id, c.id, retro);
  }
}

async function sendRenewalEmail(customerId: string, contractId: string, retro: any) {
  // Hands off to your transactional email pipeline — body is generated in B.4
  await supabase.from('email_queue').insert({
    to_customer: customerId,
    template: retro.uptier_signal === 'none' ? 'renewal_basic' : 'renewal_uptier',
    payload: { contract_id: contractId, retrospective: retro },
  });
}