import React from 'react';
import FsmTimeline from './FsmTimeline';
import LeadTimeDelta from './LeadTimeDelta';
import HealthRing from './HealthRing';
import { ServiceWorkflow } from '@/types/service-workflow';

export default function ServiceWorkflowPanel({ workflows }: { workflows: ServiceWorkflow[] }) {
  const workflow = workflows[0]; // Show the first active workflow for now

  if (!workflow) {
    return (
      <div className="p-8 text-slate-400 text-center">No active service workflows.</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <HealthRing risk={workflow.nepaConfidence} />
        <div className="ml-4">
          <div className="text-cyan-300 font-bold text-lg">{workflow.robotName}</div>
          <div className="text-xs text-slate-400">{workflow.embodiment}</div>
        </div>
      </div>
      <div className="mb-4">
        <FsmTimeline history={workflow.fsmHistory} current={workflow.fsmState} />
      </div>
      <div className="mb-4">
        <LeadTimeDelta
          classicalRul={workflow.affectedJoints[0]?.classicalBaselineRulHours ?? 0}
          nepaRul={workflow.affectedJoints[0]?.rulHours ?? 0}
        />
      </div>
      <div className="rounded-lg bg-slate-800/80 p-4 border border-slate-700">
        <div className="font-semibold text-cyan-200 mb-2">FLOOR INSPECTION</div>
        <div className="text-slate-300 text-sm">
          {workflow.failureReason
            ? <span className="text-red-400">{workflow.failureReason}</span>
            : 'All systems nominal.'}
        </div>
      </div>
    </div>
  );
}
