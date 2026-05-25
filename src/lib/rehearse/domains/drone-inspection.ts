// Domain adapter for drone-inspection
import { RehearseSessionContext, TelemetryFrame } from '../orchestrator';

export interface DroneInspectionContext {
  structure_type: 'bridge' | 'wind_turbine' | 'building_facade' | 'pipeline';
  structure_id: string;
  component_ids?: string[];
  geo: { lat: number; lon: number; alt_m: number; radius_m: number };
  conditions: {
    wind_speed_ms: number;
    wind_dir_deg: number;
    sun_azimuth_deg?: number;
    payload_kg: number;
    temperature_c?: number;
  };
  flight_path?: Array<{ x: number; y: number; z: number }>;
}

export function droneContextToSessionContext(
  ctx: DroneInspectionContext,
  session_id: string,
  run_id: string,
  substrate_run_id: string,
  deployment_id: string
): RehearseSessionContext {
  return {
    session_id,
    run_id,
    substrate_run_id,
    deployment_id,
    asset_class: ctx.structure_type,
    asset_id: ctx.structure_id,
    geo: ctx.geo,
    conditions: ctx.conditions,
    flight_path: ctx.flight_path,
    component_ids: ctx.component_ids,
    domain: 'drone-inspection',
  };
}

export function droneTelemetryToFrame(raw: Record<string, unknown>): TelemetryFrame {
  // Map raw telemetry to TelemetryFrame
  return {
    ts: typeof raw.ts === 'number' ? raw.ts : Date.now(),
    position: raw.position || { x: 0, y: 0, z: 0 },
    velocity: raw.velocity || { x: 0, y: 0, z: 0 },
    orientation: raw.orientation || { x: 0, y: 0, z: 0 },
    payload: raw.payload || null,
    extra: raw.extra || {},
  };
}
