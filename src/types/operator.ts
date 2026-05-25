export type PlanKey = 'starter' | 'pro' | 'team' | 'enterprise'

export interface OperatorIdentity {
  user_id: string
  email: string
  display_name?: string
  organisation?: string
  clearance_level: 'UNCLASSIFIED' | 'RESTRICTED' | 'SECRET' | 'TOP_SECRET'
  plan: PlanKey
  plan_status: 'active' | 'trialing' | 'past_due' | 'canceled'
  current_period_end: string | null
  cancel_at_period_end: boolean
  has_subscription: boolean
  created_at: string
}

export interface DailyUsageRecord {
  day: string          // YYYY-MM-DD
  frames: number
  videos: number
  bytes: number
}

export interface LiveUsageTelemetry {
  today: { frames: number; videos: number; bytes: number }
  history_7d: DailyUsageRecord[]
  quota: {
    frames_per_day: number
    videos_per_day: number
    bytes_per_day: number
    features: {
      audit_chain: boolean
      world_model_api: boolean
      webhooks: boolean
      air_gapped: boolean
      sse_realtime: boolean
      rtsp_ingest: boolean
    }
  }
  remaining_frames: number
  frame_pct_used: number        // 0–100, -1 if unlimited
  bytes_pct_used: number        // 0–100, -1 if unlimited
}

export interface OperatorActivity {
  id: string
  type: 'mission' | 'threat_engage' | 'registry_enroll' | 'audit_append' | 'mode_change' | 'login'
  label: string
  detail?: string
  ts: string
  plan?: PlanKey
}

export interface SubstrateSubscription {
  domain: string             // 'Defence' | 'Port Autonomy' | etc.
  substrate_instance: string
  jurisdiction: string
  status: 'active' | 'provisioning' | 'suspended'
  provisioned_at: string
  expires_at: string | null
}