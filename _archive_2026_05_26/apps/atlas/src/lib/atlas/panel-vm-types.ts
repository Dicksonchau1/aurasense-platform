// Panel ViewModel base and section-specific types for ArduPilot UI panels

export interface PanelVMBase {
  title: string;
  subtitle?: string;
  kpis: Array<{ label: string; value: string }>;
  chips: Array<{ label: string; color: string }>;
  rows: any[];
  timeline: any[];
  warnings: string[];
  lastAck: any;
  meta: Record<string, any>;
}

export interface TelemetryHealthPanelVM extends PanelVMBase {}
export interface ParametersPanelVM extends PanelVMBase {}
export interface FailsafePanelVM extends PanelVMBase {}
export interface CalibrationPanelVM extends PanelVMBase {}
export interface ModesPanelVM extends PanelVMBase {
  modes?: any[];
}
export interface MissionCommandsPanelVM extends PanelVMBase {}
export interface WaypointExecutionPanelVM extends PanelVMBase {}
export interface LogReplayPanelVM extends PanelVMBase {}
export interface PolicyReceiptPanelVM extends PanelVMBase {}
export interface VehicleLinkPanelVM extends PanelVMBase {}
