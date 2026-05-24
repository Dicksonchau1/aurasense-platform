import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ speed: 14, dir: 'NE' });
}
