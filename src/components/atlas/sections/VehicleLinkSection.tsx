import React from "react";
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import styles from "./batch3-sections.module.css";

export interface VehicleLinkPanelVM {
  kpis: Array<{ label: string; value: string }>;
  statusChips: Array<{ label: string; tone: "success" | "warning" | "critical" }>;
  timelineRows: Array<{ event: string; actor: string; timestamp: string }>;
  linkStatus?: string;
}

interface Props {
  vm: VehicleLinkPanelVM;
  onReconnect: () => void;
  onAcknowledge: (operator: string) => void;
}

const VehicleLinkSection: React.FC<Props> = ({
  vm,
  onReconnect,
  onAcknowledge,
}) => {
  return (
    <div>
      <div className={styles.flexRow}>
        {vm.kpis.map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      <div className={styles.flexChips}>
        {vm.statusChips.map((chip, i) => (
          <StatusChip key={i} label={chip.label} tone={chip.tone} />
        ))}
      </div>
      <div className={styles.marginTop16}>
        <button onClick={onReconnect}>Reconnect Link</button>
        <button onClick={() => onAcknowledge("Operator")}>Acknowledge Link</button>
        {vm.linkStatus && <span className={styles.linkStatus}>{vm.linkStatus}</span>}
      </div>
      <div className={styles.marginTop24}>
        <TimelineList rows={vm.timelineRows.map(row => ({
          title: row.event,
          subtitle: `${row.actor} @ ${row.timestamp}`
        }))} />
      </div>
    </div>
  );
};

export default VehicleLinkSection;
