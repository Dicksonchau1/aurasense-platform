// src/app/api/signature-map/query/route.ts
// GET /api/signature-map/query?lat=&lon=&alt_m=&structural_class=&regime_hash=&k_ring=

import { NextRequest, NextResponse } from 'next/server';
import { SignatureMapClient } from '@/lib/signature-map/SignatureMapClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '0');
  const lon = parseFloat(searchParams.get('lon') ?? '0');
  const alt_m = parseFloat(searchParams.get('alt_m') ?? '0');
  const structural_class = searchParams.get('structural_class') ?? '';
  const regime_hash = searchParams.get('regime_hash') ?? '';
  const k_ring = parseInt(searchParams.get('k_ring') ?? '1', 10);

  if (!structural_class || !regime_hash) {
    return NextResponse.json({ error: 'structural_class and regime_hash are required' }, { status: 400 });
  }

  try {
    const client = new SignatureMapClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const entries = await client.queryNeighbourhood({ lat, lon, alt_m, structural_class, regime_hash, k_ring });
    return NextResponse.json({ entries, count: entries.length });
  } catch (err) {
    console.error('[/api/signature-map/query]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
