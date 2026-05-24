import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    active:3, flying:2, missions:12, breaches:0,
    p95:188, verdicts:1247, facades:12
  });
}
