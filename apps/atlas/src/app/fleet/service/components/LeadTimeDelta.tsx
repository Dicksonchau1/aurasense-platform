import React from 'react';
import { leadTimeHours } from '@/lib/fleet/service-workflow';

export default function LeadTimeDelta({ classicalRul, nepaRul }: { classicalRul: number; nepaRul: number }) {
  const delta = leadTimeHours(classicalRul, nepaRul);
  return (
    <div className="flex items-center space-x-2">
      <span className="text-cyan-300 font-mono text-lg">{delta.toFixed(1)}h</span>
      <span className="text-xs text-slate-400">lead time vs. baseline</span>
    </div>
  );
}
