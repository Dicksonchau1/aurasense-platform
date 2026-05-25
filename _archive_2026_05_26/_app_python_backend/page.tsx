'use client';

import Link from 'next/link';
import { StatCard } from '@/components/stat-card';
import { WorldCard } from '@/components/world-card';
import { mockWorlds } from '@/lib/mock-data';
import { useDashboardStats, useRecentRuns } from '@/hooks/use-dashboard';
import AgentsManager from '@/components/agents/AgentsManager';

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { runs, isLoading: runsLoading, isError: runsError } = useRecentRuns();

  const summary = stats || { worlds: 0, active: 0, missions: 0, failed: 0 };
  const recentRuns = runs || [];

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="atlas-grid md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Worlds" value={summary.worlds ?? 0} delta="+1 this week" />
        <StatCard label="Active agents" value={summary.active ?? 0} delta="94% online" />
        <StatCard label="Running flows" value={summary.missions ?? 0} delta="2 queued" />
        <StatCard label="Failed runs 24h" value={summary.failed ?? 0} delta="needs review" />
      </div>

      <div className="atlas-grid xl:grid-cols-[1.4fr_0.9fr]">
        <div className="atlas-panel p-6 sm:p-8">
          <p className="atlas-label">Command surface</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">ATLAS gives you a single live view of worlds, agents, and flow execution.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">This pass sharpens layout rhythm, interaction density, and mobile behavior so the shell feels closer to an actual AuraSense control plane.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/worlds" className="atlas-button-primary">Open worlds</Link>
            <Link href="/runs" className="atlas-button-secondary">Inspect runs</Link>
          </div>
        </div>

        <div className="atlas-panel p-6">
          <p className="atlas-label">Recent activity</p>
          <div className="mt-5 space-y-4">
            {runsLoading && <div className="text-slate-400 text-sm">Loading runs...</div>}
            {runsError && <div className="text-red-400 text-sm">Error loading runs</div>}
            {!runsLoading && !runsError && recentRuns.length === 0 && (
              <p className="text-sm text-slate-500 italic">No recent activity found.</p>
            )}
            {recentRuns.slice(0, 3).map((run: any) => (
              <div key={run.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{run.name || 'Unnamed Mission'}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">{run.uav || 'N/A'}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">ETA: {run.eta_s ? `${run.eta_s}s` : 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="atlas-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agents (Admin/Global)</h2>
        <AgentsManager />
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">World workspaces</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">A high-level view of active environments with better spacing and improved scanability.</p>
          </div>
          <Link href="/worlds" className="text-sm font-medium text-teal-300 hover:text-teal-200">View all</Link>
        </div>

        <div className="atlas-grid md:grid-cols-2 xl:grid-cols-4">
          {mockWorlds.map((world) => (
            <WorldCard key={world.id} world={world} />
          ))}
        </div>
      </div>
    </section>
  );
}
