"use client";
import { useEffect, useState } from 'react';
import { computeBundleRetrospective } from './computeBundleRetrospective';

type Retrospective = Awaited<ReturnType<typeof computeBundleRetrospective>>;

export function BundleRenewalPage({ masterContractId }:{ masterContractId: string }) {
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await computeBundleRetrospective(masterContractId);
      setRetro(r);
      setLoading(false);
    })();
  }, [masterContractId]);

  if (loading || !retro) return <div className="p-12 text-center">Loading bundle retrospective…</div>;

  const color = retro.portfolioSignal === 'strong' ? 'emerald' : retro.portfolioSignal === 'moderate' ? 'blue' : 'neutral';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <p className="text-xs uppercase text-neutral-500 tracking-wider">Bundle renewal · 30 days remaining</p>
        <h1 className="text-2xl font-bold mt-1">Your bundle performance — by the numbers</h1>
        <p className="text-neutral-600 mt-2">
          Portfolio signal: <span className={`font-semibold text-${color}-700`}>{retro.portfolioSignal.toUpperCase()}</span>
        </p>
      </header>

      <section className={`rounded-lg border-2 border-${color}-300 bg-${color}-50 p-6`}>
        <h2 className={`font-semibold text-lg text-${color}-800 mb-2`}>{retro.suggestedAction}</h2>
        <p className="text-sm text-neutral-700 mb-4">
          {retro.portfolioSignal === 'strong' && (
            <>Multiple skills consistently exceeded their contracted floors. We recommend uptiering those skills and extending your bundle for another 12 months.</>
          )}
          {retro.portfolioSignal === 'moderate' && (
            <>Some skills are candidates for uptier. Review per-skill recommendations below.</>
          )}
          {retro.portfolioSignal === 'none' && (
            <>Your bundle is well-matched to your current performance. We recommend renewing as-is.</>
          )}
        </p>
        <div className="mt-4">
          <button className={`px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700`}>
            {retro.suggestedAction}
          </button>
        </div>
      </section>

      <section className="rounded-lg bg-neutral-50 p-5">
        <h3 className="font-semibold mb-3 text-sm">Per-skill recommendations</h3>
        <ul className="space-y-2">
          {retro.perSkill.map(s => (
            <li key={s.id} className="flex items-center gap-3">
              <span className="font-mono text-xs text-neutral-700">{s.skill_id}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                s.retro.uptier_signal === 'strong' ? 'bg-emerald-200 text-emerald-900' :
                s.retro.uptier_signal === 'moderate' ? 'bg-blue-200 text-blue-900' :
                'bg-neutral-200 text-neutral-700'
              }`}>
                {s.retro.uptier_signal.toUpperCase()} {s.retro.uptier_signal !== 'none' ? `→ ${s.retro.suggested_tier}` : ''}
              </span>
              <span className="text-xs text-neutral-500 ml-2">{s.retro.measurement_count} missions, {Math.round(s.retro.avg_compliance*100)}% compliance, +{Math.round(s.retro.avg_margin*100)}% margin</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}