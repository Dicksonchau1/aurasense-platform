"use client";

import React from "react";
import { AtlasSurfaceLayout } from "../components/atlas/layout";
import TelemetryHealthSection from "../components/atlas/sections/TelemetryHealthSection";
import ParametersSection from "../components/atlas/sections/ParametersSection";
import CalibrationSection from "../components/atlas/sections/CalibrationSection";
import ModesSection from "../components/atlas/sections/ModesSection";
import FailsafeSection from "../components/atlas/sections/FailsafeSection";
import MissionCommandsSection from "../components/atlas/sections/MissionCommandsSection";
import WaypointExecutionSection from "../components/atlas/sections/WaypointExecutionSection";
import LogReplaySection from "../components/atlas/sections/LogReplaySection";
import VehicleLinkSection from "../components/atlas/sections/VehicleLinkSection";
import { useDrones } from "../lib/atlas/useDrones";
import PolicyReceiptSection from "../components/atlas/sections/PolicyReceiptSection";
import {
  useArduPilotTelemetryHealth,
  useArduPilotParameters,
  useArduPilotCalibration,
  useArduPilotModes,
  useArduPilotFailsafe,
} from "../lib/atlas/hooks-ardupilot";
import {
  getCalibrationPanelVM,
  getModesPanelVM,
  getTelemetryHealthPanelVM,
  getParametersPanelVM,
  getFailsafePanelVM
} from "../lib/atlas/view-models-ardupilot";


export default function MissionCoreShell() {
  const calibration = useArduPilotCalibration();
  const modes = useArduPilotModes();
  const telemetry = useArduPilotTelemetryHealth();
  const parameters = useArduPilotParameters();
  const failsafe = useArduPilotFailsafe();

  const calibrationVM = getCalibrationPanelVM(calibration.state);
  const modesVM = getModesPanelVM(modes.state);
  const telemetryVM = getTelemetryHealthPanelVM(telemetry.state);
  const parametersVM = getParametersPanelVM(parameters.state);
  const failsafeVM = getFailsafePanelVM(failsafe.state);

  const policyReceiptVM = {
    title: "Policy Receipt",
    subtitle: "Last updated: 2026-05-18",
    kpis: [
      { label: "Receipts", value: "3" },
      { label: "Status", value: "Valid" },
    ],
    chips: [
      { label: "Compliant", color: "success" as const },
      { label: "Signed", color: "info" as const },
    ],
    rows: [],
    timeline: [
      { event: "Policy Signed", actor: "Operator A", timestamp: "2026-05-17 10:00" },
      { event: "Policy Updated", actor: "Admin", timestamp: "2026-05-16 09:00" },
    ],
    warnings: [],
    lastAck: "2026-05-17T10:00:00Z",
    meta: {
      policyDocUrl: "https://example.com/policy.pdf",
      sessionId: "demo-session",
      recommendationId: "rec-001"
    },
  };

  const { drones, loading: dronesLoading, error: dronesError } = useDrones();
  const vehicleLinkVM = {
    title: "Vehicle Link",
    subtitle: "Select a drone to link",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };

  return (
    <AtlasSurfaceLayout>
      <main className="atlas-shell p-8">
        <h1 className="text-2xl font-bold mb-6">Mission Core</h1>
        <section aria-label="Telemetry Health" className="mb-8">
          <TelemetryHealthSection vm={telemetryVM} error={telemetry.error} loading={telemetry.loading} />
        </section>
        <section aria-label="Parameters" className="mb-8">
          <ParametersSection
            vm={parametersVM}
            error={parameters.error}
            loading={parameters.loading}
            onParameterChange={parameters.updateParameter}
          />
        </section>
        <section aria-label="Calibration" className="mb-8">
          <CalibrationSection vm={calibrationVM} />
        </section>
        <section aria-label="Modes" className="mb-8">
          <ModesSection vm={modesVM} />
        </section>
        <section aria-label="Failsafe" className="mb-8">
          {failsafe.loading ? (
            <div>Loading failsafe state...</div>
          ) : failsafe.error ? (
            <div className="text-red-500">Error: {failsafe.error}</div>
          ) : (
            <FailsafeSection vm={failsafeVM} />
          )}
        </section>
        <section aria-label="Policy Receipt" className="mb-8">
          <PolicyReceiptSection vm={policyReceiptVM} onAcknowledge={() => {}} onDownloadPolicy={() => {}} />
        </section>
        <section aria-label="Vehicle Link" className="mb-8">
          {dronesLoading ? (
            <div>Loading drones...</div>
          ) : dronesError ? (
            <div className="text-red-500">Error loading drones: {dronesError}</div>
          ) : (
            <VehicleLinkSection vm={vehicleLinkVM} drones={drones} />
          )}
        </section>
      </main>
    </AtlasSurfaceLayout>
  );
}
