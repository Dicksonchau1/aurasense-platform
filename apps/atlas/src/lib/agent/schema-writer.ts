// src/lib/agent/schema-writer.ts

import { v4 as uuid } from "uuid";
import type { SkillIntent, AtlasSkill } from "@/lib/skills/types";
import { registerSkill } from "@/lib/skills/registry";
import { writeSkillCode } from "./code-writer";
import { runSandbox } from "./sandbox-runner";
import { emitAuditLog } from "@/lib/nepa/audit";

export function buildSkillSchema(intent: SkillIntent): AtlasSkill {
  const now = new Date().toISOString();

  return {
    id: `skill-${intent.proposedSkillName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    name: intent.proposedSkillName,
    version: "0.1.0",
    domain: intent.proposedDomain,
    description: intent.objective,
    tags: [intent.proposedDomain, "nepa_generated", intent.detectedDuring],
    status: "draft",
    provenance: "nepa_generated",
    autonomyLevel: "generate_sandbox_only",

    inputs: intent.requiredInputs,
    outputs: intent.expectedOutputs,
    preconditions: [],
    postconditions: [],

    safety: {
      level: intent.safetyLevel,
      requiresHumanApproval:
        intent.safetyLevel === "critical" || intent.safetyLevel === "high",
      canAffectRealHardware: false,
      maxRetries: 2,
      timeoutMs: 5000,
      emergencyAbortable: true,
    },

    orchestration: {
      executionMode: intent.executionMode,
      latencyClass: "near_realtime",
      requiresWorldModel: true,
      requiresHumanApproval:
        intent.safetyLevel === "critical" || intent.safetyLevel === "high",
      canBeComposed: true,
      canBeInterrupted: true,
      canSelfRecover: false,
      eventTriggers: [],
      failureHandlers: ["default_safe_abort"],
      policyTags: ["nepa_generated", "sandbox_required"],
    },

    benchmark: {
      required: true,
      simulationFirst: true,
      minimumPassRate: 0.9,
      benchmarkEnv: "rehearse",
    },

    audit: {
      logInputs: true,
      logOutputs: true,
      logDecisionTrace: true,
      logSafetyGate: true,
      retentionDays: 90,
    },

    implementation: {
      type: "generated_stub",
      path: `src/lib/skills/implementations/${intent.id}.ts`,
      generatedBy: "nepa_agent",
      generationReason: intent.missingCapability,
      compiledAt: now,
    },

    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Full self-extension pipeline:
 * Intent → Schema → Code → Sandbox → Register → Approval queue
 */
export async function requestSelfExtension(intent: SkillIntent): Promise<void> {
  await emitAuditLog({
    type: "self_extension_started",
    intentId: intent.id,
    missingCapability: intent.missingCapability,
    confidence: intent.confidence,
    timestamp: new Date().toISOString(),
  });

  // Step 1 — Generate schema
  const schema = buildSkillSchema(intent);

  // Step 2 — Generate implementation code
  const code = writeSkillCode(intent);

  // Step 3 — Run sandbox
  const sandboxResult = await runSandbox(intent.id, code, schema);

  // Step 4 — Update schema status based on sandbox
  schema.status = sandboxResult.passed ? "approval_pending" : "sandbox_failed";
  schema.updatedAt = new Date().toISOString();

  // Step 5 — Register into skill library
  await registerSkill(schema);

  // Step 6 — Persist generated draft for dashboard approval queue
  await persistDraft({
    intent,
    schema,
    implementationCode: code,
    testCode: generateTestCode(intent),
    sandboxResult,
    approvalStatus: sandboxResult.passed ? "pending" : "rejected",
    createdAt: new Date().toISOString(),
  });

  await emitAuditLog({
    type: "self_extension_completed",
    intentId: intent.id,
    skillId: schema.id,
    sandboxPassed: sandboxResult.passed,
    status: schema.status,
    timestamp: new Date().toISOString(),
  });
}

async function persistDraft(draft: import("@/lib/skills/types").GeneratedSkillDraft): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("nepa_skill_drafts").upsert({
    id: draft.intent.id,
    intent: draft.intent,
    schema: draft.schema,
    implementation_code: draft.implementationCode,
    test_code: draft.testCode,
    sandbox_result: draft.sandboxResult,
    approval_status: draft.approvalStatus,
    created_at: draft.createdAt,
  });
}

function generateTestCode(intent: SkillIntent): string {
  return [
    `// Auto-generated tests for: ${intent.proposedSkillName}`,
    `import { run } from "./${intent.id}";`,
    ``,
    `describe("${intent.proposedSkillName}", () => {`,
    `  it("should return a SkillResult", async () => {`,
    `    const result = await run({`,
    `      inputs: {},`,
    `      worldModel: {},`,
    `      signatureMap: {},`,
    `    });`,
    `    expect(result).toBeDefined();`,
    `    expect(result).toHaveProperty("success");`,
    `  });`,
    ``,
    `  it("should not throw on empty inputs", async () => {`,
    `    await expect(run({ inputs: {}, worldModel: {}, signatureMap: {} })).resolves.not.toThrow();`,
    `  });`,
    `});`,
  ].join("\n");
}