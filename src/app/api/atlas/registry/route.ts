import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const site = req.nextUrl.searchParams.get('site') ?? 'ICC';
  return NextResponse.json([
    { icon:'map-pin',    title:'Lead / Site',            sub:`Seal ${site} Registry` },
    { icon:'building-2', title:`Atlas ${site} Registry`, sub:'Avg inference' },
    { icon:'cpu',        title:'Jetson Orin Nano',       sub:'Edge inference' },
    { icon:'cpu',        title:'Jetson Orin Nano',       sub:'Edge inference' }
  ]);
}
