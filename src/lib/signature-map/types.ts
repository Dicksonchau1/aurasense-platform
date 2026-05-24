// src/lib/signature-map/types.ts
// SignatureMap data model — Architectural Lock #4 (2026-05-22)

export type H3Cell = string;
export type AltitudeBand = 'ground' | 'low' | 'mid' | 'high';

export interface GeometricAnchor {
  h3_cell: H3Cell;
  altitude_band: AltitudeBand;
  lat: number;
  lon: number;
  alt_m: number;
}

export interface StructuralAnchor {
  object_id: string;
  structural_class:
    | 'suspension_bridge'
    | 'cable_stayed_bridge'
    | 'wind_turbine'
    | 'building_facade'
    | 'pipeline'
    | 'generic_room'
    | string;
  node_id?: string;
  object_metadata?: Record<string, unknown>;
}

export interface RegimeAnchor {
  wind_speed_ms?: number;
  wind_direction_deg?: number;
  sun_azimuth_deg?: number;
  sun_elevation_deg?: number;
  time_of_day_utc?: string;
  payload_kg?: number;
  temperature_c?: number;
  [key: string]: unknown;
  regime_hash: string; // SHA-256 of deterministic stringify of all regime fields (minus regime_hash itself)
}

export interface SignaturePayload {
  signature_type: string;
  parameters: Record<string, number | string>;
  projectedPath?: [number, number, number][];
  confidence: number;
  observation_count: number;
}

export interface ContributionProvenance {
  deployment_id: string;
  run_id: string;
  frame_id: string;
  audit_hash: string;
  chain_hash: string;
  contributed_at: string;
}

export interface SignatureEntry {
  id: string;
  geometric_anchor: GeometricAnchor;
  structural_anchor: StructuralAnchor;
  regime_anchor: RegimeAnchor;
  signature_payload: SignaturePayload;
  contribution_provenance: ContributionProvenance;
  created_at: string;
  updated_at: string;
}

export interface SpatialQueryParams {
  lat: number;
  lon: number;
  alt_m: number;
  structural_class: string;
  regime_hash: string;
  k_ring?: number;
}
