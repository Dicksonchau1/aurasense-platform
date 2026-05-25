import React from "react";
import { KpiCard } from "../primitives/KpiCard";
import { StatusChip } from "../primitives/StatusChip";
import { TimelineList } from "../primitives/TimelineList";
import type { PolicyReceiptPanelVM } from "@/lib/atlas/view-models-ardupilot";

interface Props {
  vm: PolicyReceiptPanelVM;
  onAcknowledge?: (operator: string) => void;
  onDownloadPolicy?: () => void;
}

const PolicyReceiptSection: React.FC<Props> = ({ vm, onAcknowledge, onDownloadPolicy }) => {
  return (
    <section>
      <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
      {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
      <div className="flex flex-row gap-4 mb-2">
        {vm.kpis && vm.kpis.map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <div className="flex flex-row gap-2 mb-2">
        {vm.chips && vm.chips.map((chip, i) => (
          <StatusChip key={chip.label} color={chip.color} label={chip.label} />
        ))}
      </div>
      <div className="my-2">
        {onAcknowledge && (
          <button className="btn btn-primary mr-2" onClick={() => onAcknowledge("Operator")}>Acknowledge Policy</button>
        )}
        {vm.meta && vm.meta.policyDocUrl && (
          <a href={vm.meta.policyDocUrl as string} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-secondary" onClick={onDownloadPolicy}>Download Policy</button>
          </a>
        )}
      </div>
      <div className="mt-4">
        <TimelineList rows={vm.timeline || []} />
      </div>
    </section>
  );
};

export default PolicyReceiptSection;
