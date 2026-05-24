import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ error: 'edge/stats under maintenance' }, { status: 503 });
}
