// STUB - audit chain. Wire to real Supabase audit_chain table.
// Created during recovery on 2026-05-26.

import { createHash } from "crypto";

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  payload: Record<string, any>;
  prev_hash: string;
  row_hash: string;
}

const _chain: AuditEntry[] = [];

function hashRow(prev: string, ts: string, actor: string, action: string, payload: any): string {
  const canonical = JSON.stringify({ prev, ts, actor, action, payload });
  return createHash("sha256").update(canonical).digest("hex");
}

export async function appendAudit(opts: {
  actor: string;
  action: string;
  payload?: Record<string, any>;
}): Promise<AuditEntry> {
  const prev = _chain.length > 0 ? _chain[_chain.length - 1].row_hash : "0".repeat(64);
  const ts = new Date().toISOString();
  const payload = opts.payload ?? {};
  const row_hash = hashRow(prev, ts, opts.actor, opts.action, payload);
  const entry: AuditEntry = {
    id: "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
    ts,
    actor: opts.actor,
    action: opts.action,
    payload,
    prev_hash: prev,
    row_hash,
  };
  _chain.push(entry);
  return entry;
}

export function getChain(): AuditEntry[] {
  return [..._chain];
}

export function getChainHead(): AuditEntry | null {
  return _chain.length > 0 ? _chain[_chain.length - 1] : null;
}

export function verifyChain(): { ok: boolean; brokenAt?: number } {
  for (let i = 0; i < _chain.length; i++) {
    const e = _chain[i];
    const prev = i === 0 ? "0".repeat(64) : _chain[i - 1].row_hash;
    if (e.prev_hash !== prev) return { ok: false, brokenAt: i };
    const expected = hashRow(prev, e.ts, e.actor, e.action, e.payload);
    if (e.row_hash !== expected) return { ok: false, brokenAt: i };
  }
  return { ok: true };
}

export default { appendAudit, getChain, getChainHead, verifyChain };