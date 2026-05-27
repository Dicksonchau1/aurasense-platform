// Cross-cutting types for ATLAS Elite
export interface MissionEnvelope<T> {
  v: 1;
  topic: string;
  ts: number;
  tenantId: string;
  siteId: string;
  correlationId: string;
  causationId: string | null;
  payload: T;
  signature: string; // HMAC-SHA256 of payload + chain
  prevChainHash: string;
  chainHash: string;
}

export const AUTONOMY_LADDER = {
  L0_MANUAL:     { humanInLoop: true,  scope: 'JOYSTICK_ONLY' },
  L1_SUGGEST:    { humanInLoop: true,  scope: 'AI_PROPOSES_HUMAN_CONFIRMS' },
  L2_SUPERVISED: { humanInLoop: true,  scope: 'AI_EXECUTES_HUMAN_OBSERVES' },
  L3_GUARDED:    { humanInLoop: false, scope: 'AI_AUTONOMOUS_INSIDE_ENVELOPE' },
  L4_SITE_CERT:  { humanInLoop: false, scope: 'AUTONOMOUS_SITE_BOUNDED' },
  L5_FLEET_CERT: { humanInLoop: false, scope: 'AUTONOMOUS_FLEET_WIDE' },
} as const;

export type AutonomyLevel = keyof typeof AUTONOMY_LADDER;

export interface PolicyGateResult {
  allowed: boolean;
  requiredAutonomy: AutonomyLevel;
  denialReason?: string;
}
