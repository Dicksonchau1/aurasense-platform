// Agent + intent + plan + trace types. STDP-friendly:
// every Trace carries pre/post timing so the NEPA loop can compute Δw.

import type { Tick, Vec3 } from "@/lib/world/types";

export type AgentKind = "drone" | "humanoid" | "planner" | "sensor" | "supervisor";

export interface AgentCapability {
  id: string;          // e.g. "fly.waypoint", "grasp.tendon", "scan.lidar"
  cost: number;        // relative cost estimate
  preconds?: string[]; // referenced state keys
}

export interface Agent {
  id: string;
  kind: AgentKind;
  capabilities: AgentCapability[];
  meta?: Record<string, unknown>;
}

export type IntentKind =
  | "goto"
  | "scan"
  | "grasp"
  | "release"
  | "follow"
  | "abort"
  | "custom";

export interface Intent {
  id: string;            // uuid
  agentId: string;
  kind: IntentKind;
  payload: Record<string, unknown>; // e.g. { target: Vec3 }
  issuedTick: number;
  deadlineTick?: number;
  priority: number;      // higher = sooner
}

export interface PlanStep {
  capabilityId: string;
  args: Record<string, unknown>;
  expectedDurationTicks: number;
}

export interface Plan {
  intentId: string;
  agentId: string;
  steps: PlanStep[];
  estimatedCost: number;
  createdTick: number;
}

// One pre/post pair the STDP rule consumes. preSpike < postSpike => LTP, else LTD.
export interface Trace {
  intentId: string;
  agentId: string;
  capabilityId: string;
  preSpikeTick: number;   // when sensory/precondition fired
  postSpikeTick: number;  // when the action completed
  reward: number;         // dopamine signal in [-1, 1]
  weightTag?: string;     // optional NEPA synapse id
  meta?: Record<string, unknown>;
}

export interface OrchestratorTelemetry {
  agentsRegistered: number;
  intentsInFlight: number;
  intentsCompleted: number;
  intentsFailed: number;
  lastTraceTick: number;
}

export interface AgentSnapshot {
  agent: Agent;
  pos?: Vec3;
  currentIntent?: Intent | null;
  currentPlan?: Plan | null;
}

export interface OrchestratorEvent {
  kind:
    | "intent.issued"
    | "intent.planned"
    | "intent.completed"
    | "intent.failed"
    | "trace.emitted"
    | "agent.registered"
    | "tick";
  payload: unknown;
  tick: number;
}

export type OrchestratorListener = (e: OrchestratorEvent) => void;

// What the NEPA websocket sends back.
export interface NepaMessage {
  type: "plan" | "trace" | "telemetry" | "ack" | "error";
  data: unknown;
}