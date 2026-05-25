'use client';
'use client';

import Link from 'next/link';
import { useRuns } from '@/hooks/use-runs';
export default function RunsPage() {

  const { runs, isLoading, isError } = useRuns();
  const inFlight = runs?.in_flight || [];
  const queued = runs?.queued || [];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Runs</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Inspect execution history, current progress, and recent failures in a denser operational layout.</p>
      </div>

      {isLoading && <div className="atlas-panel p-5 text-sm text-slate-400">Loading runs...</div>}
      {isError && <div className="atlas-panel p-5 text-sm text-rose-300">Error loading runs</div>}

      <div className="space-y-4">
        {inFlight.map((run: any) => (
          <div key={run.id} className="atlas-panel p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-medium text-white">{run.name}</p>
                <p className="mt-1 text-sm text-slate-400">In flight · UAV: {run.uav} · ETA: {run.eta_s ? `${run.eta_s}s` : 'N/A'}</p>
              </div>
              <Link href={`/runs/${run.id}`} className="atlas-button-primary">Open timeline</Link>
            </div>
          </div>
        ))}
        {queued.map((run: any) => (
          <div key={run.id} className="atlas-panel p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-medium text-white">{run.name}</p>
                <p className="mt-1 text-sm text-slate-400">Queued · UAV: {run.uav} · Scheduled: {run.scheduled ? new Date(run.scheduled).toLocaleString() : 'N/A'}</p>
              </div>
              <Link href={`/runs/${run.id}`} className="atlas-button-primary">Open timeline</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
