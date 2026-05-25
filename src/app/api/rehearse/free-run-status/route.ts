import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const run_id = req.nextUrl.searchParams.get('run_id') || 'default';
  const { data } = await supabase
    .from('free_run_status')
    .select('*')
    .eq('run_id', run_id)
    .single();

  if (!data) {
    return NextResponse.json({ running: false }, { status: 200 });
  }

  return NextResponse.json({
    running: true,
    session_count: data.session_count,
    total_contributions: data.total_contributions,
    hours_elapsed: data.hours_elapsed,
    current_h3_cell: data.current_h3_cell,
    mean_uncertainty_latest: data.mean_uncertainty_latest,
  }, { status: 200 });
}
