export type SensorModality =
  | 'event_camera' | 'radar_primary' | 'radar_secondary' | 'adsb'
  | 'ais' | 'seismic' | 'acoustic' | 'rf_spectrum'

export type ThreatDomain = 'airspace' | 'ground' | 'maritime'

export type ThreatState =
  | 'nominal' | 'detected' | 'classified' | 'tracked' | 'engaged' | 'resolved'

export type EngagementVerdict = 'approved' | 'denied_fence' | 'denied_policy' | 'pending'

export interface SovereigntyFence {
  jurisdiction: string    // e.g. 'SGP-MINDEF'
  region_code: string     // e.g. 'hk-kln-1'
  classification: string  // 'RESTRICTED' | 'SECRET'
  valid_until: string     // ISO
}

export interface EngagementPolicyEval {
  verdict: EngagementVerdict
  rules_checked: string[]
  rules_passed: string[]
  rules_failed: string[]
  fence_valid: boolean
  collateral_risk: 'low' | 'medium' | 'high'
  engagement_authority_token?: string
  token_exp?: number
  audit_id?: string
}

export interface ThreatTrack {
  id: string
  domain: ThreatDomain
  threat_state: ThreatState
  sources: SensorModality[]
  confidence: number
  lat: number
  lng: number
  altitude_m?: number
  bearing_deg?: number
  speed_mps?: number
  classification?: string
  formation_geometry?: string
  behavioural_signals?: {
    coordinated_manoeuvre: boolean
    altitude_cycling: boolean
    rf_silence: boolean
    counter_clockwise_rotation: boolean
    speed_variance_low: boolean
  }
  sovereignty_fence: SovereigntyFence
  engagement_policy?: EngagementPolicyEval
  state_history: {
    state: ThreatState
    ts: string
    operator_id?: string
    audit_id?: string
  }[]
  last_updated: string
  row_hash: string
  anomaly_source_id?: string
}

export interface EngagementAuthorityToken {
  track_id: string
  token: string
  sovereignty_fence: string
  audit_id: string
  operator_id: string
  issued_at: string
  expires_at: string
  exp_unix: number
  mavlink_command_dispatched: boolean
  command_frame?: string
}

export interface DomainSummary {
  domain: ThreatDomain
  track_count: number
  highest_state: ThreatState
  has_new_events: boolean
  engaged_count: number
}

export interface ThreatConsoleState {
  tracks: ThreatTrack[]
  authority_log: EngagementAuthorityToken[]
  domain_summaries: DomainSummary[]
  last_bus_event_ts: number
  chain_integrity: boolean
}
