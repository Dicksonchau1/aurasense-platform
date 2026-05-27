// apps/atlas/src/lib/nepa/audit.ts
// Audit emit utility for NEPA Full Agent Mode
// Logs actions to nepa_audit_log (Supabase table)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEPA_SUPABASE_URL!;
const supabaseKey = process.env.NEPA_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type AuditAction =
  | 'SKILL_REGISTER'
  | 'SKILL_APPROVE'
  | 'SKILL_REJECT'
  | 'SKILL_EXECUTE'
  | 'SELF_EXTENSION_TRIGGER'
  | 'ORCHESTRATOR_TICK';

export interface AuditLogEntry {
  action: AuditAction;
  actor: string; // user id, agent id, or system
  skillId?: string;
  details?: Record<string, any>;
  timestamp?: string; // ISO string
}

export async function emitAuditLog(entry: AuditLogEntry) {
  const { action, actor, skillId, details } = entry;
  const timestamp = new Date().toISOString();
  const { error } = await supabase.from('nepa_audit_log').insert([
    {
      action,
      actor,
      skill_id: skillId ?? null,
      details: details ? JSON.stringify(details) : null,
      timestamp,
    },
  ]);
  if (error) {
    // Optionally: log to fallback, or throw
    console.error('Audit log emit failed', error);
  }
}
