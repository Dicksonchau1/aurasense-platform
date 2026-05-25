"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Retro = {
  contract_id: string; current_tier: string;
  avg_compliance: number; avg_margin: number;
  breach_count: number; uptier_signal: 'strong'|'moderate'|'none';
  suggested_tier: string; measurement_count: number;
};

export function RenewalPage({ contractId }:{ contractId: string }) {
  const [retro, setRetro] = useState<Retro | null>(null);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: r } = await supabase.rpc('compute_contract_retrospective', { p_contract_id: contractId });
      const { data: c } = await supabase.from('skill_contracts').select('*').eq('id', contractId).single();
      setRetro(r); setContract(c);
    })();
  }, [contractId]);

  if (!retro || !contract) return <div className="p-12 text-center">Loading retrospective…</div>;

  const tierColor = {
    strong:   { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800' },
    moderate: { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-800' },
    none:     { bg: 'bg-neutral-50', border: 'border-neutral-300', text: 'text-neutral-700' },
  }[retro.uptier_signal];

  const marginPct  = (retro.avg_margin * 100).toFixed(1);
  const compliance = (retro.avg_compliance * 100).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <p className="text-xs uppercase text-neutral-500 tracking-wider">Contract renewal · 30 days remaining</p>
        <h1 className="text-2xl font-bold mt-1">Your year on ATLAS — by the numbers</h1>
        <p className="text-neutral-600 mt-2">
          Skill <code className="bg-neutral-100 px-1.5 py-0.5 rounded">{contract.skill_id}</code> on
          <code className="bg-neutral-100 px-1.5 py-0.5 rounded mx-1">{contract.site_id}</code>
          — current tier <b>{retro.current_tier}</b>.
        </p>
      </header>

      {/* Measured performance — the audit data */}
      <section className="grid grid-cols-3 gap-4">
        <Stat label="SLA compliance"     value={`${compliance}%`}     hint={`across ${retro.measurement_count} missions`} good={retro.avg_compliance >= 0.99} />
        <Stat label="Avg margin above floor" value={`+${marginPct}%`} hint="how much you exceeded the contracted floor" good={retro.avg_margin >= 0.05} />
        <Stat label="SLA breaches"       value={`${retro.breach_count}`} hint={retro.breach_count===0?'clean year':'credits applied'} good={retro.breach_count === 0} />
      </section>

      {/* The recommendation card */}
      <section className={`rounded-lg border-2 ${tierColor.border} ${tierColor.bg} p-6`}>
        {retro.uptier_signal === 'none' ? (
          <>
            <h2 className={`font-semibold ${tierColor.text} mb-2`}>Renew your current tier</h2>
            <p className="text-sm text-neutral-700">
              Your current <b>{retro.current_tier}</b> tier is the right fit. We recommend renewing as-is for another 12 months.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-mono px-2 py-1 rounded ${
                retro.uptier_signal === 'strong' ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'
              }`}>
                {retro.uptier_signal.toUpperCase()} UPTIER SIGNAL
              </span>
            </div>
            <h2 className={`font-semibold text-lg ${tierColor.text} mb-2`}>
              Upgrade to <span className="capitalize">{retro.suggested_tier}</span> tier
            </h2>
            <p className="text-sm text-neutral-700 mb-4">
              You consistently exceeded your <b>{retro.current_tier}</b> tier floor by <b>+{marginPct}%</b> over
              {' '}{retro.measurement_count} measured missions. Your operations are already performing at
              {' '}<b>{retro.suggested_tier}</b>-tier levels — formalizing the upgrade gives you:
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-700 mb-5 pl-5 list-disc">
              <li>Higher contracted floors that match your real performance</li>
              <li><b>{retro.suggested_tier === 'critical' ? '3×' : '1.5×'}</b> credit multiplier on any future breach</li>
              <li>Tighter measurement window ({retro.suggested_tier === 'critical' ? '7' : '14'} days) for faster issue detection</li>
              <li>Compliance package qualifies for higher tier of government procurement</li>
            </ul>
            <div className="flex gap-2">
              <button className="px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Upgrade to {retro.suggested_tier} tier →
              </button>
              <button className="px-5 py-2.5 rounded-md bg-white border border-neutral-300 text-sm">
                Renew at current tier
              </button>
            </div>
          </>
        )}
      </section>

      {/* Compliance evidence — why we're suggesting this */}
      <section className="rounded-lg bg-neutral-50 p-5">
        <h3 className="font-semibold mb-3 text-sm">Why this recommendation?</h3>
        <p className="text-sm text-neutral-700">
          ATLAS recommends a tier upgrade only when measured compliance has consistently exceeded the
          contracted floor by ≥3% across at least 50 missions. Your data: <b>{compliance}%</b> compliance,
          <b> +{marginPct}%</b> avg margin, across <b>{retro.measurement_count}</b> missions. This
          recommendation is generated from the same audit data that produces your monthly compliance package — no
          sales judgment is involved.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, hint, good }:{ label:string; value:string; hint:string; good:boolean }) {
  return (
    <div className={`rounded p-4 ${good ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-2xl font-mono font-bold ${good?'text-emerald-700':'text-neutral-700'}`}>{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{hint}</div>
    </div>
  );
}