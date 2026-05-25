import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';
import { computeBundlePrice } from '@/atlas/skills/bundles/computeBundlePrice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

export async function POST(req: NextRequest) {
  const { items, siteId, customerId, contract_terms_per_skill } = await req.json();
  const quote = await computeBundlePrice(items);

  // 1. Create master contract (parent)
  const { data: master } = await supabase.from('skill_contracts').insert({
    site_id: siteId, customer_id: customerId,
    skill_id: '__bundle_master__',
    sla_tier: 'standard',                       // master is just the billing wrapper
    monthly_price_hkd: quote.totalMonthly,
    activation_fee_hkd: 0,
    contract_terms: { bundle: true, items: quote.perSkillEffective, tier: quote.appliedTier },
    bundle_tier: quote.appliedTier.id,
    bundle_discount_pct: quote.appliedTier.discountPct,
    status: 'pending',
  }).select('id').single();

  // 2. Create child contracts at the discounted price
  const children = await Promise.all(items.map((it: any, i: number) =>
    supabase.from('skill_contracts').insert({
      site_id: siteId, customer_id: customerId,
      skill_id: it.skillId,
      sla_tier: it.slaTier,
      monthly_price_hkd: quote.perSkillEffective[i].after,
      activation_fee_hkd: 0,
      contract_terms: contract_terms_per_skill[it.skillId],
      parent_contract_id: master!.id,
      bundle_tier: quote.appliedTier.id,
      bundle_discount_pct: quote.appliedTier.discountPct,
      status: 'pending',
    }).select('id').single()
  ));

  // 3. Single Stripe Checkout with one line item per skill (so the invoice itemizes)
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: items.map((it: any, i: number) => ({
      price_data: {
        currency: 'hkd',
        product_data: {
          name: `${it.skillId} (${it.slaTier})`,
          description: `Bundle ${quote.appliedTier.name} — ${quote.appliedTier.discountPct}% off`,
        },
        unit_amount: Math.round(quote.perSkillEffective[i].after * 100),
        recurring: { interval: 'month' },
      },
      quantity: 1,
    })),
    metadata: {
      master_contract_id: master!.id,
      child_contract_ids: children.map(c => c.data!.id).join(','),
      bundle_tier: quote.appliedTier.id,
      site_id: siteId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/skills/bundle/activated?master=${master!.id}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/skills`,
  });

  return NextResponse.json({ checkoutUrl: session.url, masterContractId: master!.id });
}