import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Example: contracts due for renewal in 30 days
  const { data: contracts } = await supabase.rpc('contracts_due_for_renewal');
  let enqueued = 0;

  for (const c of contracts ?? []) {
    // Fetch contract details for email
    const { data: contractRow } = await supabase
      .from('skill_contracts')
      .select('signed_by_email, sla_tier')
      .eq('id', c.id)
      .maybeSingle();

    // Fetch retrospective for this contract (example, adjust as needed)
    const { data: retro } = await supabase.rpc('contract_retrospective', { p_contract_id: c.id });

    // Determine offer type
    const offerType = retro?.suggested_tier && retro.suggested_tier !== contractRow?.sla_tier
      ? 'renew_uptier' : 'renew_same';

    await supabase.from('email_queue').insert({
      to_customer: c.customer_id,
      to_email: contractRow?.signed_by_email,
      template: offerType === 'renew_same' ? 'renewal_basic' : 'renewal_uptier',
      payload: {
        contract_id: c.id,
        skill_id: c.skill_id,
        site_id: c.site_id,
        current_tier: contractRow?.sla_tier,
        suggested_tier: retro?.suggested_tier,
        retrospective: retro,
        renewal_url: `${process.env.NEXT_PUBLIC_APP_URL}/renewals/${c.id}`,
      },
      dedupe_key: `renewal_${c.id}_${new Date().toISOString().slice(0,10)}`,
    }).select().maybeSingle();
    enqueued++;
  }

  return NextResponse.json({ ok: true, enqueued });
}
