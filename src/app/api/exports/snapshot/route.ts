import { NextResponse } from 'next/server';
export async function GET() {
  const snapshot = JSON.stringify({ ts: new Date().toISOString(), source: 'attas' }, null, 2);
  return new NextResponse(snapshot, {
    headers: {
      'Content-Type':'application/json',
      'Content-Disposition':'attachment; filename="attas-snapshot.json"'
    }
  });
}
