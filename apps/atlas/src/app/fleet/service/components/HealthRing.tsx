import React from 'react';
import { riskRingClass } from '@/lib/fleet/risk-color';

export default function HealthRing({ risk }: { risk: number }) {
  return (
    <div className={`w-12 h-12 rounded-full border-4 ${riskRingClass(risk)} flex items-center justify-center`}>
      <span className="text-cyan-200 font-bold">{Math.round(risk * 100)}%</span>
    </div>
  );
}
