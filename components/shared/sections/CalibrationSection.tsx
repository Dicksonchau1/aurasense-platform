import React from "react";
import { KpiCard } from "../primitives/KpiCard";
import { StatusChip } from "../primitives/StatusChip";
import { TimelineList } from "../primitives/TimelineList";
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
      <TimelineList rows={vm.timeline} />
    </div>
    {/* rows, warnings, lastAck, meta can be rendered as needed */}
  </section>
);

export default CalibrationSection;
