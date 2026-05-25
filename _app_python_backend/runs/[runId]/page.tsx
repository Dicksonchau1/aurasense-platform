import { RunTimeline } from '@/components/run-timeline';
import { mockRuns } from '@/lib/mock-data';

export default function RunDetailPage({ params }: { params: { runId: string } }) {
  const run = mockRuns.find((item) => item.id === params.runId) ?? mockRuns[0];

  return (
    <section className="space-y-6">
      <div className="atlas-panel p-6 sm:p-8">
        <p className="atlas-label">Run</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{run.flowName}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{run.status} · Triggered by {run.trigger} · Started {new Date(run.startedAt).toLocaleString()}</p>
        <div className="mt-5 h-2 w-full rounded-full bg-white/5">
          <div className="h-2 rounded-full bg-teal-400" style={{ width: `${run.progress}%` }} />
        </div>
      </div>

      <RunTimeline events={run.events} />
    </section>
  );
}
