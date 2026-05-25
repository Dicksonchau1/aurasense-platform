export type MissionState = 'standby' | 'in_flight' | 'paused' | 'complete' | 'aborted';
export type SignalStrength = '5G+' | '5G' | '4G' | 'LTE' | 'LOW' | 'LOST';
export type LogLevel = 'ok' | 'warn' | 'error' | 'info';

export interface Centroid {
  lat: number;
  lng: number;
}

export interface PanelGrid {
  cols: number;
  rows: number;
  panel_w_m: number;
  panel_h_m: number;
}

export interface MBISFace {
  face_id: string;
  azimuth_deg: number;
  area_m2: number;
  panel_grid: PanelGrid;
  atlas_url: string;
  uv_bounds: [number, number, number, number];
  defects_url: string;
  last_scanned_at?: string;
}

export interface MBISBuilding {
  mbis_id: string;
  name_en: string;
  name_zh: string;
  district: string;
  centroid: Centroid;
  height_m: number;
  floors: number;
  lod_mesh_url: string;
  faces: MBISFace[];
}

export interface BuildingPage {
  items: MBISBuilding[];
  next_cursor?: string | null;
}

export interface MissionPlanParams {
  altitude_agl: number;
  speed_mps: number;
  side_overlap_pct: number;
  front_overlap_pct: number;
  standoff_m: number;
}

export interface MissionPlan {
  mbis_id: string;
  params: MissionPlanParams;
}

export interface MissionCreate extends MissionPlan {
  label?: string;
}

export interface Mission {
  id: string;
  mbis_id: string;
  label?: string;
  state: MissionState;
  params: MissionPlanParams;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  report_url?: string | null;
}

export interface MissionValidationViolation {
  code:
    | 'geofence_restricted'
    | 'notam_active'
    | 'altitude_exceeds_ceiling'
    | 'battery_insufficient'
    | 'standoff_too_low'
    | 'rtb_unreachable';
  message: string;
  waypoint_index?: number;
}

export interface MissionValidation {
  ok: boolean;
  violations: MissionValidationViolation[];
  eta_sec?: number;
  path_length_m?: number;
  battery_pct_required?: number;
}

export interface AiModelInfo {
  name: string;
  version: string;
  mAP: number;
  classes?: string[];
  device?: string;
  updated_at: string;
}

export interface WeatherNow {
  wind_mps: number;
  wind_dir?: string;
  gust_mps: number;
  visibility_km: number;
  humidity_pct: number;
  source: string;
  observed_at: string;
}

export interface TelemetryMsg {
  t: 'telemetry';
  ts: number;
  lat: number;
  lng: number;
  alt_agl: number;
  speed: number;
  bat: number;
  sig: SignalStrength;
}

export interface PhaseMsg {
  t: 'phase';
  ts: number;
  phase: 'preflight' | 'ns' | 'ew' | 'roof' | 'rtb';
  pct: number;
}

export interface LogMsg {
  t: 'log';
  ts: number;
  level: LogLevel;
  msg: string;
}

export interface StatusMsg {
  t: 'status';
  ts: number;
  state: MissionState;
}

export type WsMsg = TelemetryMsg | PhaseMsg | LogMsg | StatusMsg;
