'use client';

import { useState } from 'react';
import { rehearseApi } from '@/lib/rehearse-api';

const initial = {
  altitude_agl: 45,
  speed_mps: 4,
  side_overlap_pct: 70,
  front_overlap_pct: 75,
  standoff_m: 8,
};

export function MissionCreateForm({ mbisId }: { mbisId: string }) {
  const [params, setParams] = useState(initial);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    try {
      setLoading(true);
      const result = await rehearseApi.validateMission({ mbis_id: mbisId, params });
      setMessage(result.ok ? 'Mission plan valid.' : `Validation issues: ${result.violations.map((v) => v.code).join(', ')}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setLoading(true);
      const mission = await rehearseApi.createMission({ mbis_id: mbisId, params, label });
      setMessage(`Mission created: ${mission.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Mission creation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atlas-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="atlas-label">Mission planning</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Create inspection mission</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-300">
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Altitude AGL
          <input type="number" value={params.altitude_agl} onChange={(e) => setParams({ ...params, altitude_agl: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Speed m/s
          <input type="number" value={params.speed_mps} onChange={(e) => setParams({ ...params, speed_mps: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Side overlap %
          <input type="number" value={params.side_overlap_pct} onChange={(e) => setParams({ ...params, side_overlap_pct: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Front overlap %
          <input type="number" value={params.front_overlap_pct} onChange={(e) => setParams({ ...params, front_overlap_pct: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
        <label className="text-sm text-slate-300">
          Standoff m
          <input type="number" value={params.standoff_m} onChange={(e) => setParams({ ...params, standoff_m: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none" />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={handleValidate} disabled={loading} className="atlas-button-secondary">Validate mission</button>
        <button onClick={handleCreate} disabled={loading} className="atlas-button-primary">Create mission</button>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
