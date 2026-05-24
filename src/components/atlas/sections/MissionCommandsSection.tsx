import React from "react";
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import styles from "./batch3-sections.module.css";

export interface MissionCommandsPanelVM {
  kpis: Array<{ label: string; value: string; }>,
  statusChips: Array<{ label: string; tone: "success" | "warning" | "critical" }>,
  timelineRows: Array<{ event: string; actor: string; timestamp: string }>,
  currentCommand?: { command: string; params: any; state: string } | null,
}

interface Props {
  vm: MissionCommandsPanelVM;
  onSendCommand: (commandKey: string, params: any) => void;
  onCancelCommand: (commandId: string) => void;
  onConfirmCommand: (commandId: string) => void;
  onRetryCommand: (commandId: string) => void;
}

const MissionCommandsSection: React.FC<Props> = ({
  vm,
  onSendCommand,
  onCancelCommand,
  onConfirmCommand,
  onRetryCommand,
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
      {vm.currentCommand && (
        <div className={styles.marginTop16}>
          <div>Current Command: {vm.currentCommand.command}</div>
          <div>State: {vm.currentCommand.state}</div>
          <button onClick={() => onCancelCommand("current")}>Cancel</button>
          <button onClick={() => onConfirmCommand("current")}>Confirm</button>
          <button onClick={() => onRetryCommand("current")}>Retry</button>
        </div>
      )}
      <div className={styles.marginTop24}>
        <TimelineList rows={vm.timelineRows.map(row => ({
          title: row.event,
          subtitle: `${row.actor} @ ${row.timestamp}`
        }))} />
      </div>
    </div>
  );
};

export default MissionCommandsSection;
