// src/lib/skills/types.ts

export type SkillDomain =
  | "perception"
  | "world_model"
  | "orchestration"
  | "actuation"
  | "verification"
  | "self_extension";

export type SkillExecutionMode =
  | "atomic"
  | "sequence"
  | "parallel"
  | "reactive"
  | "closed_loop";

export type SkillLatencyClass = "realtime" | "near_realtime" | "batch";

export type SkillSafetyLevel = "low" | "medium" | "high" | "critical";

export type SkillAutonomyLevel =
  | "suggest_only"
  | "generate_sandbox_only"
  | "generate_and_register"
  | "execute_in_simulation"
  | "execute_on_hardware";

export type SkillProvenance = "human_authored" | "nepa_generated";

export type SkillStatus =
  | "draft"
  | "sandbox_pending"
  | "sandbox_passed"
  | "sandbox_failed"
  | "approval_pending"
  | "approved"
  | "active"
  | "deprecated";

export interface SkillInputSchema {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: unknown;
}

export interface SkillOutputSchema {
  name: string;
  type: string;
  description: string;
}

export interface SkillCondition {
  field: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "exists" | "regex";
  value: unknown;
}

export interface SkillSafetyEnvelope {
  level: SkillSafetyLevel;
  requiresHumanApproval: boolean;
  canAffectRealHardware: boolean;
  maxRetries: number;
  timeoutMs: number;
  emergencyAbortable: boolean;
}

export interface SkillOrchestrationProfile {
  executionMode: SkillExecutionMode;
  latencyClass: SkillLatencyClass;
  requiresWorldModel: boolean;
  requiresHumanApproval: boolean;
  canBeComposed: boolean;
  canBeInterrupted: boolean;
  canSelfRecover: boolean;
  eventTriggers: string[];
  failureHandlers: string[];
  policyTags: string[];
}

export interface SkillBenchmarkProfile {
  required: boolean;
  simulationFirst: boolean;
  minimumPassRate: number;
  lastBenchmarkScore?: number;
  lastBenchmarkAt?: string;
  benchmarkEnv?: "rehearse" | "hardware" | "unit";
}

export interface SkillAuditProfile {
  logInputs: boolean;
  logOutputs: boolean;
  logDecisionTrace: boolean;
  logSafetyGate: boolean;
  retentionDays: number;
}

export interface SkillImplementationRef {
  type: "native" | "generated_stub" | "compiled_snn" | "remote_adapter";
  path: string;
  compiledAt?: string;
  generatedBy?: "nepa_agent" | "human";
  generationReason?: string;
}

export interface AtlasSkill {
  id: string;
  name: string;
  version: string;
  domain: SkillDomain;
  description: string;
  tags: string[];
  status: SkillStatus;
  provenance: SkillProvenance;
  autonomyLevel: SkillAutonomyLevel;

  inputs: SkillInputSchema[];
  outputs: SkillOutputSchema[];
  preconditions: SkillCondition[];
  postconditions: SkillCondition[];

  safety: SkillSafetyEnvelope;
  orchestration: SkillOrchestrationProfile;
  benchmark: SkillBenchmarkProfile;
  audit: SkillAuditProfile;
  implementation: SkillImplementationRef;

  createdAt: string;
  updatedAt: string;
  promotedAt?: string;
  approvedBy?: string;
}

// ── Orchestration graph types ──────────────────────────────────────────────

export type CapabilityNodeStatus =
  | "idle"
  | "ready"
  | "running"
  | "success"
  | "failed"
  | "blocked"
  | "skipped";

export interface CapabilityNode {
  id: string;
  skillId: string;
  label: string;
  requiredInputs: string[];
  producedOutputs: string[];
  status: CapabilityNodeStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CapabilityEdge {
  from: string;
  to: string;
  condition: string;
}

export interface CapabilityGraph {
  id: string;
  objective: string;
  missionId?: string;
  nodes: CapabilityNode[];
  edges: CapabilityEdge[];
  createdAt: string;
}

// ── NEPA agent self-extension types ───────────────────────────────────────

export interface SkillIntent {
  id: string;
  objective: string;
  missingCapability: string;
  proposedSkillName: string;
  proposedDomain: SkillDomain;
  requiredInputs: SkillInputSchema[];
  expectedOutputs: SkillOutputSchema[];
  safetyLevel: SkillSafetyLevel;
  executionMode: SkillExecutionMode;
  detectedDuring: "rehearsal" | "live_mission" | "manual" | "audit";
  detectedAt: string;
  confidence: number;
}

export interface SandboxResult {
  intentId: string;
  passed: boolean;
  testsRun: number;
  testsPassed: number;
  errors: string[];
  warnings: string[];
  durationMs: number;
  sandboxedAt: string;
  staticGatePassed: boolean;
  policyGatePassed: boolean;
}

export interface GeneratedSkillDraft {
  intent: SkillIntent;
  schema: AtlasSkill;
  implementationCode: string;
  testCode: string;
  sandboxResult?: SandboxResult;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNote?: string;
  createdAt: string;
}