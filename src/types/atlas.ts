export type CapabilityClass =
  | 'AERIAL_INTERCEPT' | 'AERIAL_ISR' | 'AERIAL_RESUPPLY'
  | 'GROUND_PATROL' | 'GROUND_BREACH' | 'PERIMETER_LOCK'
  | 'MARITIME_INTERCEPT' | 'MARITIME_ISR'
  | 'INDUSTRIAL_ACTUATOR' | 'SENSOR_ONLY' | 'DIRECTED_ENERGY'

export type CommandProtocol =
  | 'mavlink' | 'ros2_nav2' | 'modbus' | 'udp_directed_energy' | 'proprietary' | 'can_bus'

export type RegistrySource = 'effector_registry' | 'agentic_mobility_broker'
export type AssetStatus = 'active' | 'idle' | 'alert' | 'offline' | 'unverified' | 'in_mission'
export type SignatureMapVersion = 'v1' | 'v2'

export interface KinematicEnvelope {
  max_speed_mps: number; max_altitude_m?: number; range_m: number;
  endurance_s: number; payload_kg?: number; degrees_of_freedom?: number
}

export interface SovereigntyFence {
  jurisdiction: string; region_code: string; classification: string;
  valid_from: string; valid_until: string; engagement_rules_hash: string
}

export interface RegistryAsset {
  id: string; oem: string; model: string;
  capability_class: CapabilityClass; source: RegistrySource; status: AssetStatus;
  command_protocol: CommandProtocol; kinematic_envelope: KinematicEnvelope;
  sovereignty_fence: SovereigntyFence; battery_pct?: number; lat?: number; lng?: number;
  ip_address?: string; hardware_id?: string; firmware_version?: string;
  registered_at: string; last_heartbeat: string;
  signature_map_version: SignatureMapVersion;
  capability_contract_hash: string;
  oem_integration_verified: boolean; notes?: string
}

export type NewRegistryAsset = Omit<RegistryAsset,
  'id' | 'registered_at' | 'last_heartbeat' | 'capability_contract_hash'>

export interface BeaconEvent {
  ts: string; emergency: boolean; multicast_group: string;
  enrolled: number; asset_ids: string[]
}

export interface TopologyEdge {
  source_id: string; target_id: string;
  reason: 'same_capability_class' | 'same_region' | 'same_jurisdiction'
}

export interface TopologyGraph { nodes: RegistryAsset[]; edges: TopologyEdge[] }
