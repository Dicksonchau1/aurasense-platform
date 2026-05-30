import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { registryId: string } }
) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from('registry')
      .update({
        ...body,
        last_seen: new Date().toISOString(),
      })
      .eq('id', params.registryId)
      .select()
      .single();

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { registryId: string } }
) {
  try {
    const { error } = await supabase
      .from('registry')
      .delete()
      .eq('id', params.registryId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
