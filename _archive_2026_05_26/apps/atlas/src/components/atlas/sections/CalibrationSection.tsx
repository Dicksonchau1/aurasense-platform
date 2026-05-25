import React from "react";
import { KpiCard } from "../KpiCard";
import { StatusChip } from "../StatusChip";
import { TimelineRow } from "../TimelineRow";
import type { CalibrationPanelVM } from "@/lib/atlas/view-models-ardupilot";

interface Props {
  vm: CalibrationPanelVM;
}

const CalibrationSection: React.FC<Props> = ({ vm }) => (
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
    <div className="space-y-2">
      {vm.timeline.map((row: { label: string; value?: string }, i: number) => (
        <TimelineRow key={i} label={row.label} value={typeof row.value === 'string' ? row.value : ''} />
      ))}
    </div>
    {/* rows, warnings, lastAck, meta can be rendered as needed */}
  </section>
);

export default CalibrationSection;
