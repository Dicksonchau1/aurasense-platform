import React from 'react';
import { ServiceWorkflow } from '@/types/service-workflow';

export default function ServiceWorkflowList({ workflows }: { workflows: ServiceWorkflow[] }) {
  if (!workflows.length) {
    return <div className="text-slate-500 text-sm">No active workflows.</div>;
  }
  return (
    <div className="space-y-2">
      {workflows.map(wf => (
        <div key={wf.workflowId} className="flex items-center p-3 rounded-lg bg-slate-900 border border-slate-800 shadow">
          <span className="text-cyan-300 font-semibold mr-2">{wf.robotName}</span>
          <span className="text-xs text-slate-400">{wf.fsmState}</span>
        </div>
      ))}
    </div>
  );
}
