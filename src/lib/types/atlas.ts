// Shared ATLAS types. Some shapes match the existing @/lib/mock/* files
// so the dashboard pages keep rendering during the swap.
// TODO: VERIFY each shape against the real Supabase row schema before committing.

export type AssetClass = "drone" | "robot" | "agent";
export type AssetStatus = "ready" | "charging" | "fault" | "offline";

export interface FleetItem {
  id: string;
  name: string;
  class: AssetClass;
  status: AssetStatus;
  battery_pct: number;
  // TODO: VERIFY column name — may be `last_seen_at` or `last_seen` in your schema
  last_seen_at: string;
  location?: { lat: number; lng: number; alt_m?: number };
}

export type AlertSeverity = "info" | "warn" | "danger";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  source: string;       // TODO: VERIFY — could be asset_id or descriptive label
  message: string;
  ts: string;
}

export interface ActivityItem {
  id: string;
  actor: string;        // TODO: VERIFY — could be user_id or operator label
  action: string;
  target?: string;
  ts: string;
  audit_hash?: string;
}

export type Tier = "free" | "nursing" | "enterprise";  // TODO: VERIFY matches src/lib/auth/domain-router

export type PlanKey = "starter" | "pro" | "team" | "enterprise"; // TODO: VERIFY matches src/lib/billing/plans

export interface MyPlan {
  plan: PlanKey;
  tier: Tier;
  status: "active" | "trialing" | "past_due" | "canceled" | "none";
  current_period_end?: string;
  stripe_customer_id?: string;
  // TODO: VERIFY — `/api/billing/me` may return more or fewer fields
}

export interface SkillSummary {
  id: string;
  name: string;
  cat: string;
  status: string;
  ver: string;
  color: string;
  // TODO: VERIFY against existing src/lib/mock/skills.ts Skill type
}

export interface MissionSummary {
  id: string;
  name: string;
  status: "queued" | "active" | "completed" | "failed";
  waypoints_count: number;
  started_at?: string;
  // TODO: VERIFY shape matches /api/nepa/missions/active response
}

export interface StdpSnapshot {
  ts: string;
  weight_matrix: number[][];
  dopamine: number;
  eligibility_traces: number[];
  // TODO: VERIFY against /api/nepa/inference/stdp actual response
}

export interface WorldModelPrediction {
  asset_id: string;
  predicted_path: { x: number; y: number; z: number; t: number }[];
  prediction_error: number;
  // TODO: VERIFY against /api/nepa/world-model/predict actual response
}