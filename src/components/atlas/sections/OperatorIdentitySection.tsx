import React from "react";
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import styles from "./batch3-sections.module.css";

export interface OperatorIdentityPanelVM {
  kpis: Array<{ label: string; value: string }>;
  statusChips: Array<{ label: string; tone: "success" | "warning" | "critical" | "anonymous" | "authenticated" | "escalated" | "expired" }>;
  timelineRows: Array<{ actor: string; action: string; target: string; timestamp: string }>;
  currentOperator?: { operatorId: string; displayName: string; role: string; clearanceLevel: string; sessionStartedAt: string };
  activeSessions?: Array<{ operatorId: string; displayName: string; role: string; clearanceLevel: string; sessionStartedAt: string }>;
  recentActions?: Array<{ actor: string; action: string; target: string; timestamp: string }>;
  authenticationState?: string;
}

interface Props {
  vm: OperatorIdentityPanelVM;
  onRequestEscalation: (reason: string) => void;
  onEndSession: (operatorId: string) => void;
  onAcknowledgeAction: (actionId: string) => void;
  onAcknowledge: (operator: string) => void;
}

const OperatorIdentitySection: React.FC<Props> = ({
  vm,
  onRequestEscalation,
  onEndSession,
  onAcknowledgeAction,
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
          <StatusChip key={i} label={chip.label} tone={chip.tone as any} />
        ))}
      </div>
      <div className={styles.marginTop16}>
        {vm.currentOperator && (
          <div>
            <h4>Current Operator</h4>
            <div>ID: {vm.currentOperator.operatorId}</div>
            <div>Name: {vm.currentOperator.displayName}</div>
            <div>Role: {vm.currentOperator.role}</div>
            <div>Clearance: {vm.currentOperator.clearanceLevel}</div>
            <div>Session Start: {vm.currentOperator.sessionStartedAt}</div>
            <button onClick={() => onEndSession(vm.currentOperator.operatorId)}>End Session</button>
          </div>
        )}
        <button onClick={() => onRequestEscalation("Manual escalation")}>Request Escalation</button>
        <button onClick={() => onAcknowledge("Operator")}>Acknowledge</button>
      </div>
      <div className={styles.marginTop24}>
        <TimelineList rows={vm.timelineRows.map(row => ({
          title: `${row.action} → ${row.target}`,
          subtitle: `${row.actor} @ ${row.timestamp}`
        }))} />
      </div>
    </div>
  );
};

export default OperatorIdentitySection;
