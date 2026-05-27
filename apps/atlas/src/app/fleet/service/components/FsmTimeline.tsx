import React from 'react';
import { FSM_ORDER, FSM_LABELS } from '@/lib/fleet/service-workflow';
import type { FsmState } from '@/types/service-workflow';

export default function FsmTimeline({ history, current }: { history: any[]; current: FsmState }) {
  return (
    <div className="flex items-center space-x-2">
      {FSM_ORDER.map((state, idx) => {
        const isActive = state === current;
        const isDone = history.some(h => h.state === state);
        return (
          <div key={state} className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 ${isDone ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700 bg-slate-800'} ${isActive ? 'ring-2 ring-cyan-300' : ''}`} />
            <span className={`ml-1 text-xs ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>{FSM_LABELS[state]}</span>
            {idx < FSM_ORDER.length - 1 && <span className="mx-1 text-slate-600">→</span>}
          </div>
        );
      })}
    </div>
  );
}
