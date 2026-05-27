// apps/atlas/src/lib/audit/emit.ts
// DEPRECATED: Use /lib/nepa/audit.ts emitAuditLog instead
// This file is a compatibility shim for legacy imports.

import type { AuditLogEntry } from "@/lib/nepa/audit";
import { emitAuditLog } from "@/lib/nepa/audit";

/**
 * @deprecated Use emitAuditLog from /lib/nepa/audit instead
 */
export async function emitAuditEvent(entry: any) {
  // Map legacy event shape to AuditLogEntry
  const { type, skillId, actor, ...rest } = entry;
  const action =
    type === "skill_execution_started" ? "SKILL_EXECUTE" :
    type === "skill_execution_completed" ? "SKILL_EXECUTE" :
    type === "skill_execution_failed" ? "SKILL_EXECUTE" :
    type === "self_extension_started" ? "SELF_EXTENSION_TRIGGER" :
    type === "self_extension_completed" ? "SELF_EXTENSION_TRIGGER" :
    type === "skill_approved" ? "SKILL_APPROVE" :
    type === "skill_rejected" ? "SKILL_REJECT" :
    type === "skill_registered" ? "SKILL_REGISTER" :
    "ORCHESTRATOR_TICK";
  await emitAuditLog({
    action,
    actor: actor ?? "system",
    skillId,
    details: rest,
  });
}
