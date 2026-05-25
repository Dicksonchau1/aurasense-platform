// Canonical NEPA substrate types
export interface SubstrateConfig {
  [key: string]: any;
}

export interface SubstrateStatus {
  status: string;
}

export interface LayerConfig {
  [key: string]: any;
}

export interface LayerDescriptor {
  layer_id: string;
  config: LayerConfig;
}

export interface ReflexSignal {
  signal: any;
}

export interface ReflexOutcome {
  outcome: any;
}

export interface CouplingEvent {
  event: string;
  timestamp: number;
}

export interface AdaptationTrace {
  trace: number[];
}

export interface Envelope {
  session_id: string;
  timestamp: number;
  payload: any;
  trust_level: number;
  policy_refs: string[];
}

export interface AuditEvent {
  event_id: string;
  session_id: string;
  event_type: string;
  channel: string;
  payload: Record<string, any>;
  timestamp: number;
  agent_id: string;
  operator_id?: string;
}
