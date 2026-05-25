import React from 'react';
import { KpiCard } from '../KpiCard';
import { StatusChip } from '../StatusChip';
import type { ModesPanelVM } from '@/lib/atlas/view-models-ardupilot';

interface Props {
  vm: ModesPanelVM;
}

const ModesSection: React.FC<Props> = ({ vm }) => (
  <section>
    <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
    {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
    <div className="grid grid-cols-2 gap-4 mb-4">
      {vm.kpis.map((kpi: { label: string; value: string | number; unit?: string }) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      {vm.chips.map((chip: { label: string; color?: string }) => (
        <StatusChip key={chip.label} {...chip} />
      ))}
    </div>
    <ul className="space-y-2">
      {(vm.modes ?? []).map((mode: { label: string; active: boolean }) => (
        <li key={mode.label} className="flex items-center gap-2">
          <span>{mode.label}</span>
          {mode.active && <span className="text-green-600 font-bold">(Active)</span>}
        </li>
      ))}
    </ul>
    {/* rows, warnings, lastAck, meta can be rendered as needed */}
  </section>
);

export default ModesSection;
