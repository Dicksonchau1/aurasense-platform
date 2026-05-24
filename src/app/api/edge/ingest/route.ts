import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ error: 'edge/ingest under maintenance' }, { status: 503 });
}
