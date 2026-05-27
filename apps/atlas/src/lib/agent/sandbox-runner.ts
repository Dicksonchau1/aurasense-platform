// src/lib/agent/sandbox-runner.ts

import type { AtlasSkill, SandboxResult } from "@/lib/skills/types";

interface StaticAnalysisResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Static AST-level gate: reject forbidden patterns.
 * Whitelist: only ATLAS SDK imports allowed.
 */
function staticGate(code: string): StaticAnalysisResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const FORBIDDEN_PATTERNS = [
    { pattern: /\beval\b/, label: "eval() is forbidden" },
    { pattern: /\bexec\b/, label: "exec() is forbidden" },
    { pattern: /require\(['\"]child_process['\"]\)/, label: "child_process import forbidden" },
    { pattern: /require\(['\"]fs['\"]\)/, label: "fs import forbidden in generated skills" },
    { pattern: /process\.exit/, label: "process.exit() forbidden" },
    { pattern: /fetch\(/, label: "External fetch forbidden (no external API calls)" },
    { pattern: /axios/, label: "axios import forbidden (no external API calls)" },
    {
      pattern: /import .* from ['\"](?!@\/lib\/skills|@\/lib\/audit|@\/lib\/nepa)/,
      label: "Only @/lib/skills, @/lib/audit, @/lib/nepa imports allowed",
    },
  ];

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(label);
    }
  }

  if (code.includes("// TODO")) {
    warnings.push("Generated stub contains unimplemented TODOs");
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Policy gate: check skill tags and safety level.
 */
function policyGate(skill: AtlasSkill): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  if (skill.safety.canAffectRealHardware && skill.status !== "approved") {
    errors.push("Hardware-affecting skill requires explicit approval");
  }

  if (!skill.orchestration.policyTags.includes("nepa_generated")) {
    errors.push("Missing nepa_generated policy tag");
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Structural property tests: validate the code exports `run()` correctly.
 */
function propertyTests(code: string): { passed: boolean; testsRun: number; testsPassed: number; errors: string[] } {
  const errors: string[] = [];
  let testsRun = 0;
  let testsPassed = 0;

  // Test 1 — has export async function run
  testsRun++;
  if (/export async function run/.test(code)) {
    testsPassed++;
  } else {
    errors.push("Missing export async function run()");
  }

  // Test 2 — returns SkillResult shape
  testsRun++;
  if (/success:/.test(code) && /outputs:/.test(code)) {
    testsPassed++;
  } else {
    errors.push("run() must return { success, outputs }");
  }

  // Test 3 — has input ctx parameter
  testsRun++;
  if (/ctx: SkillRuntimeInput/.test(code) || /ctx:/.test(code)) {
    testsPassed++;
  } else {
    errors.push("run() must accept ctx parameter");
  }

  // Test 4 — not empty function body
  testsRun++;
  const body = code.match(/async function run[^{]*{([\s\S]*?)^}/m)?.[1] ?? "";
  if (body.trim().length > 10) {
    testsPassed++;
  } else {
    errors.push("run() body is empty");
  }

  return {
    passed: errors.length === 0,
    testsRun,
    testsPassed,
    errors,
  };
}

/**
 * Full sandbox runner.
 */
export async function runSandbox(
  intentId: string,
  code: string,
  skill: AtlasSkill
): Promise<SandboxResult> {
  const startMs = Date.now();

  const staticResult = staticGate(code);
  const policyResult = policyGate(skill);
  const propResult = propertyTests(code);

  const allErrors = [
    ...staticResult.errors,
    ...policyResult.errors,
    ...propResult.errors,
  ];

  const allWarnings = [...staticResult.warnings];

  const passed =
    staticResult.passed && policyResult.passed && propResult.passed;

  return {
    intentId,
    passed,
    testsRun: propResult.testsRun,
    testsPassed: propResult.testsPassed,
    errors: allErrors,
    warnings: allWarnings,
    durationMs: Date.now() - startMs,
    sandboxedAt: new Date().toISOString(),
    staticGatePassed: staticResult.passed,
    policyGatePassed: policyResult.passed,
  };
}