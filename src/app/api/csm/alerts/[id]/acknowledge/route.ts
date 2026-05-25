import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { csm_user } = await req.json();
  await supabase.from('csm_alerts').update({
    acknowledged_at: new Date().toISOString(),
    acknowledged_by: csm_user,
  }).eq('id', params.id);
  return NextResponse.json({ ok: true });
}
