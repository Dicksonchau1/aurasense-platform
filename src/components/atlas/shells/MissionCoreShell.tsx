"use client";

import React from "react";
import { AtlasSurfaceLayout } from "@/components/atlas/layout";
import { MissionHeaderSection } from "@/components/atlas/sections/MissionHeaderSection";
import { TelemetryHealthSection } from "@/components/atlas/sections/TelemetryHealthSection";
import { ParametersSection } from "@/components/atlas/sections/ParametersSection";
import { MissionStatusBar } from "@/components/atlas/sections/MissionStatusBar";

import {
  useArduPilotTelemetryHealth,
  useArduPilotParameters,
  useArduPilotFailsafe,
  useArduPilotMissionCommands,
} from "@/lib/atlas/hooks-ardupilot";
import { useArduPilotLogReplay, useArduPilotWaypointExecution } from "@/lib/atlas/hooks-ardupilot";
import styles from "../sections/batch3-sections.module.css";

import {
  getTelemetryHealthPanelVM,
  getParametersPanelVM,
  getFailsafePanelVM,
  getMissionCommandsPanelVM,
} from "@/lib/atlas/view-models-ardupilot";
import { getLogReplayPanelVM, getWaypointExecutionPanelVM } from "@/lib/atlas/view-models-ardupilot";
import { PolicyReceiptSection, VehicleLinkSection } from "@/components/atlas/sections";
import { useArduPilotPolicyReceipt, useArduPilotVehicleLink } from "@/lib/atlas/hooks-ardupilot";
import { getPolicyReceiptPanelVM, getVehicleLinkPanelVM } from "@/lib/atlas/view-models-ardupilot";

import { FailsafeSection } from "@/components/atlas/sections/FailsafeSection";
import { MissionCommandsSection } from "@/components/atlas/sections/MissionCommandsSection";
import LogReplaySection from "@/components/atlas/sections/LogReplaySection";
import WaypointExecutionSection from "@/components/atlas/sections/WaypointExecutionSection";
import { ModelReleaseSection, OperatorIdentitySection } from "@/components/atlas/sections";
import { useArduPilotModelReleases, useArduPilotOperatorIdentity } from "@/lib/atlas/hooks-ardupilot";
import { getModelReleasePanelVM, getOperatorIdentityPanelVM } from "@/lib/atlas/view-models-ardupilot";

export default function MissionCoreShell() {
  const telemetryHealth = useArduPilotTelemetryHealth();
  const parameters = useArduPilotParameters();

  // Batch 3 hooks
  const failsafe = useArduPilotFailsafe();
  const missionCommands = useArduPilotMissionCommands();

    // Batch 4 hooks
    const logReplay = useArduPilotLogReplay();
    const waypointExecution = useArduPilotWaypointExecution();

  const telemetryVM = getTelemetryHealthPanelVM(telemetryHealth.state);
  const parametersVM = getParametersPanelVM(parameters.state);

  const failsafeVM = getFailsafePanelVM(failsafe.state);
  const missionCommandsVM = getMissionCommandsPanelVM(missionCommands.state);

    // Batch 4 view-models
    const logReplayVM = getLogReplayPanelVM(logReplay.state);
    const waypointExecutionVM = getWaypointExecutionPanelVM(waypointExecution.state);

  const policyReceipt = useArduPilotPolicyReceipt();
  const vehicleLink = useArduPilotVehicleLink();
  const policyReceiptVM = getPolicyReceiptPanelVM(policyReceipt.state);
  const vehicleLinkVM = getVehicleLinkPanelVM(vehicleLink.state);

  const modelReleases = useArduPilotModelReleases();
  const operatorIdentity = useArduPilotOperatorIdentity();
  const modelReleaseVM = getModelReleasePanelVM(modelReleases.state);
  const operatorIdentityVM = getOperatorIdentityPanelVM(operatorIdentity.state);

  return (
    <AtlasSurfaceLayout>
      <MissionHeaderSection
        title="Mission Core"
        subtitle="Operator Console"
      />

      <MissionStatusBar />

      <section aria-label="Telemetry Health" className={styles.sectionSpacing}>
        <TelemetryHealthSection vm={telemetryVM} />
      </section>

      <section aria-label="Parameters" className={styles.sectionSpacing}>
        <ParametersSection
          vm={parametersVM}
          onParameterChange={parameters.updateParameter}
        />
      </section>

      {/* Batch 2: Calibration, Modes would go here if present */}

      <section aria-label="Failsafe" className={styles.sectionSpacing}>
        <FailsafeSection
          vm={failsafeVM}
          onSetPolicy={failsafe.setPolicy}
          onArm={failsafe.arm}
          onDisarm={failsafe.disarm}
          onTriggerManualFailsafe={failsafe.triggerManualFailsafe}
          onAcknowledge={failsafe.acknowledge}
          onOverride={failsafe.override}
        />
      </section>

      <section aria-label="Mission Commands" className={styles.sectionSpacing}>
        <MissionCommandsSection
          vm={missionCommandsVM}
          onSendCommand={missionCommands.sendCommand}
          onCancelCommand={missionCommands.cancelCommand}
          onConfirmCommand={missionCommands.confirmCommand}
          onRetryCommand={missionCommands.retryCommand}
        />
      </section>

        {/* Batch 4: WaypointExecution and LogReplay */}
        <section aria-label="Waypoint Execution" className={styles.sectionSpacing}>
          <WaypointExecutionSection
            vm={waypointExecutionVM}
            onSkipToWaypoint={waypointExecution.skipToWaypoint}
            onHoldAtCurrent={waypointExecution.holdAtCurrent}
            onResumeMission={waypointExecution.resumeMission}
            onAbortMission={waypointExecution.abortMission}
            onAcknowledge={waypointExecution.acknowledge}
          />
        </section>
        <section aria-label="Log Replay" className={styles.sectionSpacing}>
          <LogReplaySection
            vm={logReplayVM}
            onSelectLog={logReplay.selectLog}
            onPlay={logReplay.play}
            onPause={logReplay.pause}
            onSeek={logReplay.seek}
            onStep={logReplay.step}
            onSetRate={logReplay.setRate}
            onAddMarker={logReplay.addMarker}
            onAcknowledge={logReplay.acknowledge}
          />
        </section>

        <section aria-label="Vehicle Link" className={styles.sectionSpacing}>
          <VehicleLinkSection
            vm={vehicleLinkVM}
            onReconnect={vehicleLink.reconnect}
            onAcknowledge={vehicleLink.acknowledge}
          />
        </section>
        <section aria-label="Policy Receipt" className={styles.sectionSpacing}>
          <PolicyReceiptSection
            vm={policyReceiptVM}
            onAcknowledge={policyReceipt.acknowledge}
            onDownloadPolicy={policyReceipt.downloadPolicy}
          />
        </section>

        <section aria-label="Model Release" className={styles.sectionSpacing}>
          <ModelReleaseSection
            vm={modelReleaseVM}
            onSelectRelease={modelReleases.selectRelease}
            onCompareReleases={modelReleases.compareReleases}
            onPromoteRelease={modelReleases.promoteRelease}
            onRollbackRelease={modelReleases.rollbackRelease}
            onAcknowledge={modelReleases.acknowledge}
          />
        </section>
        <section aria-label="Operator Identity" className={styles.sectionSpacing}>
          <OperatorIdentitySection
            vm={operatorIdentityVM}
            onRequestEscalation={operatorIdentity.requestEscalation}
            onEndSession={operatorIdentity.endSession}
            onAcknowledgeAction={operatorIdentity.acknowledgeAction}
            onAcknowledge={operatorIdentity.acknowledge}
          />
        </section>
    </AtlasSurfaceLayout>
  );
}
