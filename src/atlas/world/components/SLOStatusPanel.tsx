'use client';

import { useEffect, useState } from 'react';

type SLOSummary = {
  key: string; n: number;
  sloCompliance: number; slaCompliance: number;
  lastValue: number; breaches: number;
};

export function SLOStatusPanel({ siteId }:{ siteId: string }) {
  const [data, setData] = useState<SLOSummary[]>([]);
  useEffect(() => {
    fetch(`/api/slo/status?siteId=${siteId}&days=30`)
      .then(r=>r.json()).then(d=>setData(d.summary));
  }, [siteId]);

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-sm">Coverage SLO â€” last 30 days</h3>
      {data.map(row => {
        const slaOk = row.slaCompliance >= 0.99; // expecting >99% of missions to meet SLA
        const [skillId, sloName] = row.key.split('::');
        return (
          <div key={row.key} className={`rounded p-3 border ${slaOk?'border-emerald-200 bg-emerald-50':'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-mono text-neutral-600">{skillId}</div>
                <div className="text-sm font-semibold">{sloName}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${slaOk?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>
                {slaOk ? 'SLA met' : 'SLA breach'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div><span className="text-neutral-500">SLO compliance </span>{(row.sloCompliance*100).toFixed(1)}%</div>
              <div><span className="text-neutral-500">SLA compliance </span>{(row.slaCompliance*100).toFixed(1)}%</div>
              <div><span className="text-neutral-500">Breaches </span>{row.breaches}/{row.n}</div>
            </div>
          </div>
        );
      })}
      {!data.length && <p className="text-sm text-neutral-500">No SLO data yet for this site.</p>}
    </div>
  );
}
