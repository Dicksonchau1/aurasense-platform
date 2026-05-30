import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(
  req: NextRequest,
  { params }: { params: { droneId: string } }
) {
  try {
    const limit = req.nextUrl.searchParams.get('limit') || '100';

    const { data, error } = await supabase
      .from('telemetry')
      .select('*')
      .eq('drone_id', params.droneId)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { droneId: string } }
) {
  try {
    const body = await req.json();
    body.drone_id = params.droneId;
    body.timestamp = new Date().toISOString();

    const { data, error } = await supabase
      .from('telemetry')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
