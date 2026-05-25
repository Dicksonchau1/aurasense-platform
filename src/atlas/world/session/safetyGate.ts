// src/atlas/world/session/safetyGate.ts
// Hard runtime guard. Rehearsal MUST NOT publish to live drone topics.
// This is the last line between simulation and a real motor command.

import type { Action, WorldMode } from '../types';

export class SafetyGateError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'SafetyGateError';
  }
}

export interface SafetyContext {
  mode: WorldMode;
  sessionId: string;
  siteId: string;
  allowLive: boolean;
}

export function assertCanPublishLive(ctx: SafetyContext): void {
  if (ctx.mode !== 'live') {
    throw new SafetyGateError(
      `[safetyGate] blocked: tried to publish to live topics while mode=${ctx.mode} session=${ctx.sessionId}`
    );
  }
  if (!ctx.allowLive) {
    throw new SafetyGateError(
      `[safetyGate] blocked: allowLive=false for site=${ctx.siteId}`
    );
  }
}

export function guardAction(ctx: SafetyContext, a: Action): Action {
  if (ctx.mode === 'rehearsal') return a;
  assertCanPublishLive(ctx);
  for (const t of a.thrust) {
    if (!Number.isFinite(t) || t < 0 || t > 1) {
      throw new SafetyGateError(`[safetyGate] thrust out of bounds: ${t}`);
    }
  }
  return a;
}

export const REHEARSAL_GUARD_ENV = 'NEXT_PUBLIC_REHEARSAL_GUARD';

export function rehearsalGuardActive(): boolean {
  if (typeof process === 'undefined') return true;
  return process.env[REHEARSAL_GUARD_ENV] !== 'off';
}
