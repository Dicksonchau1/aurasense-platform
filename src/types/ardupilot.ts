export type ArduPilotFlightMode =
  | 'STABILIZE' | 'ACRO' | 'ALT_HOLD' | 'AUTO' | 'GUIDED' | 'LOITER'
  | 'RTL' | 'CIRCLE' | 'LAND' | 'DRIFT' | 'SPORT' | 'POSHOLD'
  | 'BRAKE' | 'THROW' | 'SMART_RTL' | 'FLOWHOLD' | 'FOLLOW' | 'ZIGZAG'

export type ModeSlot = 1 | 2 | 3 | 4 | 5 | 6

export interface FlightModeConfig {
  slot: ModeSlot
  mode: ArduPilotFlightMode
  rc_pwm_min: number    // e.g. 1165
  rc_pwm_max: number    // e.g. 1295
  label?: string
}

export type CalibrationSensor = 'accelerometer' | 'gyroscope' | 'compass' | 'esc' | 'level'

export type CalibrationStepId =
  | 'idle'
  | 'pre_check'
  | 'position_flat'
  | 'position_left'
  | 'position_right'
  | 'position_nose_down'
  | 'position_nose_up'
  | 'position_back'
  | 'collecting'
  | 'computing'
  | 'commit'
  | 'complete'
  | 'failed'

export interface CalibrationStep {
  id: CalibrationStepId
  label: string
  instruction: string
  illustration: string   // ASCII art or emoji
  duration_ms: number
}

export interface SensorCalibrationState {
  sensor: CalibrationSensor
  step: CalibrationStepId
  step_index: number
  total_steps: number
  confidence: number     // 0.0–1.0
  offsets?: { x: number; y: number; z: number }
  temperature_c?: number
  last_calibrated?: string
  audit_id?: string
}

export interface ModeChangeRecord {
  slot: ModeSlot
  from_mode: ArduPilotFlightMode
  to_mode: ArduPilotFlightMode
  operator_id: string
  hmac_token: string
  audit_id: string
  ts: string
}

export interface ArdupilotLog {
  id: string
  filename: string
  vehicle_id: string
  duration_s: number
  start_ts: string
  end_ts: string
  size_bytes: number
  row_count: number
  has_anomalies: boolean
  anomaly_count: number
}

export interface LogReplayFrame {
  ts_ms: number          // relative ms from log start
  attitude: { roll: number; pitch: number; yaw: number }
  position: { lat: number; lng: number; alt_m: number }
  velocity: { vx: number; vy: number; vz: number }
  battery: { voltage: number; current: number; remaining_pct: number }
  mode: ArduPilotFlightMode
  rc_inputs: number[]
  anomaly_flag: boolean
  anomaly_class?: string
}

export type NermMode = 'STANDBY' | 'ACTIVE' | 'EMERGENCY' | 'CALIBRATING' | 'OFFLINE'

export interface NermStatus {
  mode: NermMode
  codec: 'ultra_low_latency' | 'standard' | 'compressed'
  inference_hz: number
  last_frame_ts: string | null
  queue_depth: number
  drop_rate: number
  latency_p50_ms: number
  latency_p99_ms: number
  energy_uw: number
  spike_rate_hz: number
  plasticity_events: number
  adaptation_rate: number
}