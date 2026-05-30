// ============================================================
// STUB - returns ok timestamps. Wire to real polygon engine.
// Created during emergency recovery on 2026-05-26.
// ============================================================
import type { RehearseSessionContext, TelemetryFrame } from './types';

export interface OrchestratorDeps {
  sessionId: string;
  runId: string;
  substrateClient: any;
  signatureMapClient: any;
  broadcastSceneEvent: (event: any) => void | Promise<void>;
}

export class PolygonEngineOrchestrator {
  constructor(public readonly deps: OrchestratorDeps) {}

  async onSessionStart(_ctx: RehearseSessionContext) {
    return { ok: true, session_id: this.deps.sessionId, started_at: Date.now() };
  }

  async onTick(_ctx: RehearseSessionContext, _frame: TelemetryFrame) {
    return { ok: true, ts: Date.now() };
  }

  async onSessionEnd(_ctx: RehearseSessionContext) {
    return { ok: true, session_id: this.deps.sessionId, ended_at: Date.now() };
  }
}

export function orchestratorSessionHandler(deps: OrchestratorDeps) {
  return new PolygonEngineOrchestrator(deps);
}

export default PolygonEngineOrchestrator;