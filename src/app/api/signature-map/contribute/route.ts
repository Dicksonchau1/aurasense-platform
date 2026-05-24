// src/app/api/signature-map/contribute/route.ts
// POST /api/signature-map/contribute  body: { entries: SignatureEntry[] }

import { NextRequest, NextResponse } from 'next/server';
import { SignatureMapClient } from '@/lib/signature-map/SignatureMapClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = body?.entries;
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'entries[] required' }, { status: 400 });
    }

    const client = new SignatureMapClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await client.contribute(entries);
    return NextResponse.json({ ok: true, contributed: entries.length });
  } catch (err) {
    console.error('[/api/signature-map/contribute]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
