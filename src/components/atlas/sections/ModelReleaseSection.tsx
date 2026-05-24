import React from "react";
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import styles from "./batch3-sections.module.css";

export interface ModelReleasePanelVM {
  kpis: Array<{ label: string; value: string }>;
  statusChips: Array<{ label: string; tone: "success" | "warning" | "critical" | "blocked" | "staging" | "promoted" | "rolling-back" }>;
  timelineRows: Array<{ event: string; version: string; channel: string; actor: string; timestamp: string }>;
  activeRelease?: { modelId: string; version: string; channel: string; releasedAt: string; integrityHash: string; deploymentState: string; performanceBaseline: string; regressionFlags: string[] };
  comparisonRelease?: { modelId: string; version: string; channel: string; releasedAt: string; integrityHash: string; deploymentState: string; performanceBaseline: string; regressionFlags: string[] };
  rolloutState?: string;
}

interface Props {
  vm: ModelReleasePanelVM;
  onSelectRelease: (modelId: string, version: string) => void;
  onCompareReleases: (idA: string, idB: string) => void;
  onPromoteRelease: (releaseId: string, channel: string) => void;
  onRollbackRelease: (releaseId: string, reason: string) => void;
  onAcknowledge: (operator: string) => void;
}

const ModelReleaseSection: React.FC<Props> = ({
  vm,
  onSelectRelease,
  onCompareReleases,
  onPromoteRelease,
  onRollbackRelease,
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
        {vm.activeRelease && (
          <div>
            <h4>Active Release</h4>
            <div>Model: {vm.activeRelease.modelId}</div>
            <div>Version: {vm.activeRelease.version}</div>
            <div>Channel: {vm.activeRelease.channel}</div>
            <div>Released: {vm.activeRelease.releasedAt}</div>
            <div>Integrity: {vm.activeRelease.integrityHash}</div>
            <div>Deployment: {vm.activeRelease.deploymentState}</div>
            <div>Performance: {vm.activeRelease.performanceBaseline}</div>
            <div>Regression Flags: {vm.activeRelease.regressionFlags?.join(", ") || "None"}</div>
            <button onClick={() => onPromoteRelease(vm.activeRelease.modelId, vm.activeRelease.channel)}>Promote</button>
            <button onClick={() => onRollbackRelease(vm.activeRelease.modelId, "Manual rollback")}>Rollback</button>
          </div>
        )}
        {vm.comparisonRelease && (
          <div className={styles.marginTop16}>
            <h4>Comparison Release</h4>
            <div>Model: {vm.comparisonRelease.modelId}</div>
            <div>Version: {vm.comparisonRelease.version}</div>
            <div>Channel: {vm.comparisonRelease.channel}</div>
            <div>Released: {vm.comparisonRelease.releasedAt}</div>
            <div>Integrity: {vm.comparisonRelease.integrityHash}</div>
            <div>Deployment: {vm.comparisonRelease.deploymentState}</div>
            <div>Performance: {vm.comparisonRelease.performanceBaseline}</div>
            <div>Regression Flags: {vm.comparisonRelease.regressionFlags?.join(", ") || "None"}</div>
            <button onClick={() => onCompareReleases(vm.activeRelease?.modelId || "", vm.comparisonRelease.modelId)}>Compare</button>
          </div>
        )}
        <button onClick={() => onAcknowledge("Operator")}>Acknowledge</button>
      </div>
      <div className={styles.marginTop24}>
        <TimelineList rows={vm.timelineRows.map(row => ({
          title: `${row.event} v${row.version} (${row.channel})`,
          subtitle: `${row.actor} @ ${row.timestamp}`
        }))} />
      </div>
    </div>
  );
};

export default ModelReleaseSection;
