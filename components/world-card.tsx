import Link from 'next/link';
import { World } from '@/lib/types';

function statusColor(status: World['status']) {
  if (status === 'active') return 'bg-emerald-400';
  if (status === 'paused') return 'bg-amber-400';
  if (status === 'error') return 'bg-rose-400';
  return 'bg-slate-500';
}

export function WorldCard({ world }: { world: World }) {
  return (
    <Link
      href={`/worlds/${world.id}`}
      className="atlas-panel-soft block p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{world.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{world.description}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
          <span className={`h-2 w-2 rounded-full ${statusColor(world.status)}`} />
          {world.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
        <div>
          <p className="atlas-label">Agents</p>
          <p className="mt-2 font-medium text-white">{world.agentCount}</p>
        </div>
        <div>
          <p className="atlas-label">Active flows</p>
          <p className="mt-2 font-medium text-white">{world.activeRunCount}</p>
        </div>
        <div>
          <p className="atlas-label">Region</p>
          <p className="mt-2 font-medium text-white">{world.region || 'N/A'}</p>
        </div>
        <div>
          <p className="atlas-label">Updated</p>
          <p className="mt-2 font-medium text-white">{new Date(world.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
