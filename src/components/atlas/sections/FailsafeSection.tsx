import React from "react";
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import styles from "./batch3-sections.module.css";

export interface FailsafePanelVM {
  kpis: Array<{ label: string; value: string; }>,
  statusChips: Array<{ label: string; tone: "success" | "warning" | "critical" }>,
  timelineRows: Array<{ cause: string; actor: string; timestamp: string }>,
  ackState: string,
}

interface Props {
  vm: FailsafePanelVM;
  onSetPolicy: (policyKey: string, value: any) => void;
  onArm: () => void;
  onDisarm: () => void;
  onTriggerManualFailsafe: (reason: string) => void;
  onAcknowledge: (operator: string) => void;
  onOverride: (operator: string, reason: string) => void;
}

const FailsafeSection: React.FC<Props> = ({
  vm,
  onSetPolicy,
  onArm,
  onDisarm,
  onTriggerManualFailsafe,
  onAcknowledge,
  onOverride,
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
        <button onClick={onArm}>Arm</button>
        <button onClick={onDisarm}>Disarm</button>
        <button onClick={() => onTriggerManualFailsafe("Manual Triggered")}>Trigger Manual Failsafe</button>
        <button onClick={() => onAcknowledge("Operator")}>Acknowledge</button>
        <button onClick={() => onOverride("Operator", "Override Reason")}>Override</button>
      </div>
      <div className={styles.marginTop24}>
        <TimelineList rows={vm.timelineRows.map(row => ({
          title: row.cause,
          subtitle: `${row.actor} @ ${row.timestamp}`
        }))} />
      </div>
    </div>
  );
};

export default FailsafeSection;
