import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  console.log(`[attas] mission ${id} cmd:`, body);
  return NextResponse.json({ ok: true, missionId: id, ...body });
}
