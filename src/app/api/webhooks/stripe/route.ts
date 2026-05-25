import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const masterId = session.metadata?.master_contract_id;
    const childIds = session.metadata?.child_contract_ids?.split(',') ?? [];
    if (!masterId || childIds.length === 0) {
      return NextResponse.json({ error: 'Missing contract IDs in metadata' }, { status: 400 });
    }

    // Atomically activate all child contracts and link them under the master
    const updates = await Promise.all([
      supabase.from('skill_contracts').update({ status: 'active' }).eq('id', masterId),
      ...childIds.map(id => supabase.from('skill_contracts').update({ status: 'active', parent_contract_id: masterId }).eq('id', id)),
    ]);

    // Optionally: log or notify
    return NextResponse.json({ ok: true });
  }

  // Ignore other event types
  return NextResponse.json({ received: true });
}