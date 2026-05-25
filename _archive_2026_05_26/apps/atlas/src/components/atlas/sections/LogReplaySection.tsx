import React from "react";
import { useRuns } from "@/hooks/use-runs";

const LogReplaySection: React.FC = () => {
  const { data: runs, isLoading, isError } = useRuns();

  return (
    <section>
      <h2 className="text-lg font-bold mb-2">Log Replay</h2>
      {isLoading && <div className="text-slate-400 mb-2">Loading runs...</div>}
      {isError && <div className="text-rose-400 mb-2">Error loading runs</div>}
      {Array.isArray(runs) && runs.length > 0 ? (
        <ul className="list-disc ml-6">
          {runs.map((run: any) => (
            <li key={run.id} className="mb-1">
              <span className="font-semibold">Run #{run.id}</span> &mdash; Status: {run.status}, Started: {run.started_at}
            </li>
          ))}
        </ul>
      ) : !isLoading && <div className="text-slate-400">No runs available</div>}
    </section>
  );
};

export default LogReplaySection;
