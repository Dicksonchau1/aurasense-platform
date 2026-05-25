// --- Panel VM Types ---
export interface PanelVMBase {
  title: string;
  subtitle?: string;
  kpis: Array<{ label: string; value: string; unit?: string }>;
  chips: Array<{ label: string; color: string }>;
  rows: any[];
  timeline: any[];
  warnings: any[];
  lastAck: string | null;
  meta: Record<string, unknown>;
}

export type CalibrationPanelVM = PanelVMBase;
export type ModesPanelVM = PanelVMBase & { modes: Array<{ label: string; active: boolean }> };
export type TelemetryHealthPanelVM = PanelVMBase;
export type ParametersPanelVM = PanelVMBase;
export type FailsafePanelVM = PanelVMBase;
export type MissionCommandsPanelVM = PanelVMBase;
export type WaypointExecutionPanelVM = PanelVMBase;
export type LogReplayPanelVM = PanelVMBase;
export type PolicyReceiptPanelVM = PanelVMBase;
export type VehicleLinkPanelVM = PanelVMBase;
export type ModelReleasePanelVM = PanelVMBase;
export type OperatorIdentityPanelVM = PanelVMBase;

// --- Panel VM Getters ---
export function getCalibrationPanelVM(state: any): CalibrationPanelVM {
  return {
    title: "Calibration",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getModesPanelVM(state: any): ModesPanelVM {
  return {
    title: "Modes",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
    modes: [],
  };
}

export function getTelemetryHealthPanelVM(state: any): TelemetryHealthPanelVM {
  return {
    title: "Telemetry Health",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getParametersPanelVM(state: any): ParametersPanelVM {
  return {
    title: "Parameters",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getFailsafePanelVM(state: any): FailsafePanelVM {
  return {
    title: "Failsafe",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getMissionCommandsPanelVM(state: any): MissionCommandsPanelVM {
  return {
    title: "Mission Commands",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getWaypointExecutionPanelVM(state: any): WaypointExecutionPanelVM {
  return {
    title: "Waypoint Execution",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getLogReplayPanelVM(state: any): LogReplayPanelVM {
  return {
    title: "Log Replay",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getPolicyReceiptPanelVM(state: any): PolicyReceiptPanelVM {
  return {
    title: "Policy Receipt",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getVehicleLinkPanelVM(state: any): VehicleLinkPanelVM {
  return {
    title: "Vehicle Link",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getModelReleasePanelVM(state: any): ModelReleasePanelVM {
  return {
    title: "Model Release",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}

export function getOperatorIdentityPanelVM(state: any): OperatorIdentityPanelVM {
  return {
    title: "Operator Identity",
    subtitle: "",
    kpis: [],
    chips: [],
    rows: [],
    timeline: [],
    warnings: [],
    lastAck: null,
    meta: {},
  };
}
