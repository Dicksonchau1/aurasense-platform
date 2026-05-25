// ATLAS OS — Task 7 Types
// Append-only: FleetUnit, EdgeStreamSlot, EdgeStreamEvent, OsStatusSnapshot

// TEMP: Define CapabilityClass until Task 2 types are available
export type CapabilityClass = 'basic' | 'advanced' | 'premium';

export interface FleetUnit {
  id: string;                          // asset_id from registry store
  oem: string;
  model: string;
  capability_class: CapabilityClass;   // from Task 2 types
  domain: 'aerial' | 'ground' | 'maritime' | 'sensor' | 'industrial';
  status: AssetStatus;                 // from Task 2 types
  battery_pct: number | null;
  lat: number | null;
  lng: number | null;
  altitude_m: number | null;
  speed_mps: number | null;
  heading_deg: number | null;
  mission_id: string | null;           // linked active mission from Task 5
  mission_name: string | null;
  last_heartbeat: string;
  signal_strength: number;             // 0–100
  firmware_version: string;
  ip_address: string | null;
}

export interface EdgeStreamSlot {
  slot_id: string;
  asset_id?: string;
  status: 'open' | 'streaming' | 'idle' | 'closed' | 'error';
  opened_at: string;
  last_event_ts: string | null;
  fps: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  bitrate_kbps: number;
  frames_processed: number;
  errors: number;
  plan: string;
}

export interface EdgeStreamEvent {
  slot_id: string;
  kind: 'frame_ack' | 'infer_complete' | 'anomaly' | 'error' | 'heartbeat' | 'close';
  ts: string;
  latency_ms?: number;
  detection_count?: number;
  gate_state?: GateStateSimple;
  error_msg?: string;
}

export interface OsStatusSnapshot {
  ts: string;
  substrate_instance: string;
  region: string;
  // ATLAS OS store counts
  active_threats: number;
  engaged_threats: number;
  active_missions: number;
  in_flight_missions: number;
  enrolled_assets: number;
  active_assets: number;
  unverified_assets: number;
  // Audit
  audit_records: number;
  chain_valid: boolean;
  // Runtime
  runtime_ok: boolean;
  runtime_adapter: string;
  runtime_queue_depth: number;
  // Weather
  flight_advisory: 'GREEN' | 'AMBER' | 'RED';
  wind_speed_ms: number;
  // Fleet
  fleet_total: number;
  fleet_in_mission: number;
  fleet_battery_avg: number | null;
  // Anomaly bus
  anomaly_rate_per_min: number;
  last_anomaly_ts: number | null;
}
