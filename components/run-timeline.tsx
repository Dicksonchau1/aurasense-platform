import { RunEvent } from '@/lib/types';

function dot(level: RunEvent['level']) {
  if (level === 'success') return 'bg-emerald-400';
  if (level === 'warning') return 'bg-amber-400';
  if (level === 'error') return 'bg-rose-400';
  return 'bg-sky-400';
}

export function RunTimeline({ events }: { events: RunEvent[] }) {
  return (
    <div className="atlas-panel p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Run timeline</h2>
      <div className="mt-5 space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot(event.level)}`} />
              {index < events.length - 1 ? <span className="mt-1 h-full w-px bg-white/10" /> : null}
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-white">{event.source}</span>
                <span className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400">{event.level}</span>
                <span className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
