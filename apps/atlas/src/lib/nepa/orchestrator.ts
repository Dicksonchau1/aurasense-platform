// src/lib/nepa/orchestrator.ts

import type {
  CapabilityGraph,
  CapabilityNode,
  SkillIntent,
  AtlasSkill,
} from "@/lib/skills/types";
import { getSkillById } from "@/lib/skills/registry";
import { emitAuditLog } from "@/lib/nepa/audit";
import { requestSelfExtension } from "@/lib/agent/schema-writer";

// ── Global autonomy mode (read from Redis or env fallback) ─────────────────

type AutonomyMode = "SHADOW" | "AUTONOMOUS" | "LOCKDOWN";

async function getAutonomyMode(): Promise<AutonomyMode> {
  // In production: read from Redis nepa:global_autonomy_mode
  // Fallback for local dev:
  return (process.env.NEPA_AUTONOMY_MODE as AutonomyMode) ?? "SHADOW";
}

// ── Policy gate ────────────────────────────────────────────────────────────

interface PolicyGateResult {
  allowed: boolean;
  reason?: string;
}

function policyGate(skill: AtlasSkill, mode: AutonomyMode): PolicyGateResult {
  if (mode === "LOCKDOWN") {
    return { allowed: false, reason: "System in LOCKDOWN mode" };
  }

  if (mode === "SHADOW" && skill.safety.canAffectRealHardware) {
    return {
      allowed: false,
      reason: "Hardware-affecting skill blocked in SHADOW mode",
    };
  }

  if (
    skill.safety.requiresHumanApproval &&
    skill.status !== "approved"
  ) {
    return { allowed: false, reason: "Skill requires human approval" };
  }

  return { allowed: true };
}

// ── Context ────────────────────────────────────────────────────────────────

export interface NepaContext {
  missionId: string;
  siteId: string;
  agentId: string;
  worldModelSnapshot: Record<string, unknown>;
  signatureMap: Record<string, number>;
  currentObjective: string;
  autonomyMode: AutonomyMode;
  outputs: Record<string, unknown>;
}

// ── Node executor ──────────────────────────────────────────────────────────

async function executeNode(
  node: CapabilityNode,
  skill: AtlasSkill,
  ctx: NepaContext
): Promise<{ success: boolean; outputs: Record<string, unknown>; error?: string }> {
  const startedAt = new Date().toISOString();

  await emitAuditLog({
    type: "skill_execution_started",
    skillId: skill.id,
    nodeId: node.id,
    missionId: ctx.missionId,
    agentId: ctx.agentId,
    autonomyMode: ctx.autonomyMode,
    timestamp: startedAt,
  });

  try {
    // Dynamic import of the skill implementation
    const mod = await import(`@/lib/skills/implementations/${skill.id}`).catch(
      () => null
    );

    if (!mod?.run) {
      // Skill stub — not yet implemented
      return {
        success: false,
        error: `Skill ${skill.id} has no active implementation (stub)`,
      };
    }

    const result = await mod.run({
      inputs: node.requiredInputs.reduce(
        (acc, key) => ({ ...acc, [key]: ctx.outputs[key] }),
        {}
      ),
      worldModel: ctx.worldModelSnapshot,
      signatureMap: ctx.signatureMap,
    });

    await emitAuditLog({
      type: "skill_execution_completed",
      skillId: skill.id,
      nodeId: node.id,
      missionId: ctx.missionId,
      success: true,
      outputs: result.outputs,
      timestamp: new Date().toISOString(),
    });

    return { success: true, outputs: result.outputs };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);

    await emitAuditLog({
      type: "skill_execution_failed",
      skillId: skill.id,
      nodeId: node.id,
      missionId: ctx.missionId,
      error,
      timestamp: new Date().toISOString(),
    });

    return { success: false, error };
  }
}

// ── Condition evaluator ────────────────────────────────────────────────────

function evaluateCondition(
  condition: string,
  ctx: NepaContext
): boolean {
  // Simple dot-notation evaluation: "crackCandidates.confidence > 0.65"
  try {
    const [path, op, val] = condition.split(" ");
    const parts = path.split(".");
    let actual: unknown = ctx.outputs;
    for (const p of parts) actual = (actual as Record<string, unknown>)?.[p];

    const num = parseFloat(String(actual));
    const threshold = parseFloat(val);

    if (op === ">") return num > threshold;
    if (op === "<") return num < threshold;
    if (op === ">=") return num >= threshold;
    if (op === "<=") return num <= threshold;
    if (op === "===") return String(actual) === val;
    if (op === "available") return actual !== undefined && actual !== null;

    return Boolean(actual);
  } catch {
    return false;
  }
}

// ── Main orchestration tick ────────────────────────────────────────────────

export async function runCapabilityGraph(
  graph: CapabilityGraph,
  ctx: NepaContext
): Promise<{ completed: boolean; failedNodeId?: string; missingSkills: string[] }> {
  const mode = await getAutonomyMode();
  ctx.autonomyMode = mode;

  const missingSkills: string[] = [];

  // Topological execution — nodes run in dependency order
  const executed = new Set<string>();

  for (const node of graph.nodes) {
    // Check if all predecessor nodes have succeeded
    const predecessors = graph.edges
      .filter((e) => e.to === node.id)
      .map((e) => e.from);

    const allPredecessorsDone = predecessors.every((predId) =>
      executed.has(predId)
    );

    if (!allPredecessorsDone) {
      node.status = "blocked";
      continue;
    }

    // Evaluate edge condition from predecessor
    const incomingEdge = graph.edges.find((e) => e.to === node.id);
    if (incomingEdge && !evaluateCondition(incomingEdge.condition, ctx)) {
      node.status = "skipped";
      executed.add(node.id);
      continue;
    }

    const skill = await getSkillById(node.skillId);

    if (!skill) {
      // NEPA capability gap detected — trigger self-extension
      missingSkills.push(node.skillId);

      const intent: SkillIntent = {
        id: `intent-${Date.now()}-${node.skillId}`,
        objective: graph.objective,
        missingCapability: node.skillId,
        proposedSkillName: node.label,
        proposedDomain: "orchestration",
        requiredInputs: node.requiredInputs.map((n) => ({
          name: n,
          type: "unknown",
          required: true,
          description: `Auto-detected input: ${n}`,
        })),
        expectedOutputs: node.producedOutputs.map((n) => ({
          name: n,
          type: "unknown",
          description: `Auto-detected output: ${n}`,
        })),
        safetyLevel: "medium",
        executionMode: "atomic",
        detectedDuring: "rehearsal",
        detectedAt: new Date().toISOString(),
        confidence: 0.85,
      };

      // Fire-and-forget self-extension (async, does not block graph)
      requestSelfExtension(intent).catch(console.error);

      node.status = "blocked";
      continue;
    }

    // Policy gate
    const gate = policyGate(skill, mode);
    if (!gate.allowed) {
      node.status = "blocked";
      await emitAuditLog({
        type: "policy_gate_blocked",
        skillId: skill.id,
        nodeId: node.id,
        reason: gate.reason,
        missionId: ctx.missionId,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    node.status = "running";
    node.startedAt = new Date().toISOString();

    const result = await executeNode(node, skill, ctx);

    if (result.success) {
      node.status = "success";
      // Merge outputs into ctx for downstream nodes
      Object.assign(ctx.outputs, result.outputs);
    } else {
      node.status = "failed";
      node.error = result.error;
      return { completed: false, failedNodeId: node.id, missingSkills };
    }

    node.completedAt = new Date().toISOString();
    executed.add(node.id);
  }

  return { completed: true, missingSkills };
}