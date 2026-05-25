import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const siteId  = req.nextUrl.searchParams.get('siteId');
  if (!siteId) {
    return NextResponse.json({ error: 'Missing required query param: siteId' }, { status: 400 });
  }
  const skillId = req.nextUrl.searchParams.get('skillId');
  const days    = parseInt(req.nextUrl.searchParams.get('days') ?? '30');

  const since = new Date(Date.now() - days*24*60*60*1000).toISOString();
  let query = supabase.from('skill_slo_measurements')
    .select('*').eq('site_id', siteId).gte('measured_at', since);
  if (skillId) query = query.eq('skill_id', skillId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });

  const grouped = data.reduce((acc, row) => {
    const key = `${row.skill_id}::${row.slo_name}`;
    if (!acc[key]) acc[key] = { measurements: [], sloMet: 0, slaMet: 0 };
    acc[key].measurements.push(row);
    if (row.slo_met) acc[key].sloMet++;
    if (row.sla_met) acc[key].slaMet++;
    return acc;
  }, {} as Record<string, any>);

  const summary = Object.entries(grouped).map(([k, v]: [string, any]) => ({
    key: k,
    n: v.measurements.length,
    sloCompliance: +(v.sloMet / v.measurements.length).toFixed(3),
    slaCompliance: +(v.slaMet / v.measurements.length).toFixed(3),
    lastValue: v.measurements.at(-1)?.measured_value,
    breaches: v.measurements.filter((m: any) => !m.sla_met).length,
  }));

  return NextResponse.json({ summary });
}
