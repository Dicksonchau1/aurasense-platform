// ============================================================
// STUB - minimal types. Expand as rehearse pipeline solidifies.
// Created during emergency recovery on 2026-05-26.
// ============================================================
export interface RehearseSessionContext {
  session_id: string;
  run_id?: string;
  [key: string]: any;
}

export interface TelemetryFrame {
  ts: number;
  [key: string]: any;
}