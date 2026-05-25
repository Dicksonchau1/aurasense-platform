import { NextResponse } from 'next/server';
import { pickRuntime } from '@/lib/runtime';

export async function GET() {
  const rt = pickRuntime();
  const h = await rt.health();
  return NextResponse.json(h);
}