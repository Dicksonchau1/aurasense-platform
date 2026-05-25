'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DiverRow = {
  step: number; pos_error_m: number; replay_pos_error_m: number; model_confidence: number;
};

export function DivergenceDashboard({ promotionId }:{ promotionId: string }) {
  const [rows, setRows] = useState<DiverRow[]>([]);
  const [stats, setStats] = useState<{
    meanErr: number; maxErr: number; driftSteps: number; totalSteps: number;
  } | null>(null);

  useEffect(() => {
    supabase.from('trajectory_divergences')
      .select('step,pos_error_m,replay_pos_error_m,model_confidence')
      .eq('mission_promotion_id', promotionId)
      .order('step')
      .then(({ data }) => {
        if (!data) return;
        setRows(data as DiverRow[]);
        const valid = data.filter(r => r.pos_error_m != null);
        const errs  = valid.map(r => r.pos_error_m);
        setStats({
          meanErr:    +(errs.reduce((a,b)=>a+b,0)/errs.length).toFixed(3),
          maxErr:     +Math.max(...errs).toFixed(3),
          driftSteps: valid.filter(r => r.pos_error_m > 0.5).length,
          totalSteps: data.length,
        });
      });
  }, [promotionId]);

  if (!stats) return <div className="p-4 text-sm">Loading divergence…</div>;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold">Trajectory Divergence — Mission {promotionId.slice(0,8)}</h3>
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Mean pos error" value={`${stats.meanErr}m`} warn={stats.meanErr > 0.3}/>
        <StatCard label="Max pos error"  value={`${stats.maxErr}m`}  warn={stats.maxErr  > 1.0}/>
        <StatCard label="Drift steps"    value={`${stats.driftSteps}/${stats.totalSteps}`} warn={stats.driftSteps > 5}/>
        <StatCard label="Drift rate"     value={`${((stats.driftSteps/stats.totalSteps)*100).toFixed(1)}%`} warn={stats.driftSteps/stats.totalSteps > 0.1}/>
      </div>
      <DivergenceSparkline rows={rows}/>
      <div className="text-xs text-neutral-500">
        Drift threshold: &gt;0.5m positional error. &gt;10% drift steps triggers model refresh flag.
      </div>
    </div>
  );
}

function StatCard({ label, value, warn }:{ label:string; value:string; warn:boolean }) {
  return (
    <div className={`rounded p-3 ${warn ? 'bg-red-50' : 'bg-emerald-50'}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-xl font-mono ${warn ? 'text-red-700' : 'text-emerald-700'}`}>{value}</div>
    </div>
  );
}

function DivergenceSparkline({ rows }:{ rows: DiverRow[] }) {
  const w=600, h=80, pad=4;
  if (!rows.length) return null;
  const vals = rows.map(r=>r.pos_error_m??0);
  const mx = Math.max(...vals, 0.1);
  const pts = vals.map((v,i)=>`${pad + (i/(vals.length-1))*(w-pad*2)},${h-pad-(v/mx)*(h-pad*2)}`).join(' ');
  return (
    <svg width={w} height={h} className="w-full">
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth={1.5}/>
      <line x1={pad} y1={h-pad-(0.5/mx)*(h-pad*2)} x2={w-pad} y2={h-pad-(0.5/mx)*(h-pad*2)}
        stroke="#ef4444" strokeDasharray="4" strokeWidth={1}/>
    </svg>
  );
}
