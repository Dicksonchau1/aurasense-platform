// Types for @atlas/power-orchestrator
export interface BatteryTelemetry {
  robotId: string;
  timestamp: number;
  voltageV: number;
  currentA: number;
  socPercent: number;
  temperatureC: number;
  cellsTemperatureC: number[];
  cycleCount: number;
  healthPercent: number;
  predictedRuntimeMin: number;
}

export type BayState = 'IDLE' | 'RESERVED' | 'SWAPPING' | 'FAULTED' | 'OFFLINE';

export interface ChargingBay {
  bayId: string;
  siteId: string;
  state: BayState;
  currentRobotId: string | null;
  queue: Array<{ robotId: string; reservedAt: number; priority: number }>;
  batteriesReady: number;
  capacity: number;
  lastSwapDurationS: number | null;
}

export type SwapEventType =
  | 'GO_TO_CHARGE_ISSUED'
  | 'BAY_RESERVED'
  | 'ROBOT_DOCKED'
  | 'SWAP_STARTED'
  | 'SWAP_COMPLETED'
  | 'SWAP_FAILED'
  | 'POST_SWAP_VERIFIED'
  | 'ROBOT_RELEASED';

export interface BatterySwapEvent {
  eventId: string;
  robotId: string;
  bayId: string;
  type: SwapEventType;
  timestamp: number;
  durationMs?: number;
  failureReason?: string;
  preSocPercent?: number;
  postSocPercent?: number;
  removedBatterySerial?: string;
  installedBatterySerial?: string;
  chainHash: string;
}
