import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    chain_length: 0,
    last_row_hash: null,
    last_appended_at: null,
    note: 'STUB - replace with real evidence chain head query',
  });
}