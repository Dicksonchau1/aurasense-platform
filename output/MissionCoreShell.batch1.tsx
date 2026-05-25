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
} from "@/lib/atlas/hooks-ardupilot";

import {
  getTelemetryHealthPanelVM,
  getParametersPanelVM,
} from "@/lib/atlas/view-models-ardupilot";

export default function MissionCoreShell() {
  const telemetryHealth = useArduPilotTelemetryHealth();
  const parameters = useArduPilotParameters();

  const telemetryVM = getTelemetryHealthPanelVM(telemetryHealth.state);
  const parametersVM = getParametersPanelVM(parameters.state);

  return (
    <AtlasSurfaceLayout>
      <MissionHeaderSection
        title="Mission Core"
        subtitle="Operator Console"
      />

      <MissionStatusBar />

      <section aria-label="Telemetry Health" className="mt-6">
        <TelemetryHealthSection vm={telemetryVM} />
      </section>

      <section aria-label="Parameters" className="mt-6">
        <ParametersSection
          vm={parametersVM}
          onParameterChange={parameters.updateParameter}
        />
      </section>
    </AtlasSurfaceLayout>
  );
}
