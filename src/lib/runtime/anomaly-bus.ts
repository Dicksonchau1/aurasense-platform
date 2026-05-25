// STUB - anomaly event bus. Wire to real event-driven anomaly source.
// Created during recovery on 2026-05-26.

export interface AnomalyEvent {
  id: string;
  ts: number;
  source: string;
  kind: "spike" | "drift" | "intruder" | "envelope_breach" | "comm_loss";
  severity: "low" | "medium" | "high" | "critical";
  payload: Record<string, any>;
}

type Listener = (event: AnomalyEvent) => void;
const _listeners = new Set<Listener>();

/**
 * Subscribe to anomaly events. Returns an unsubscribe function.
 * Used by /api/atlas/threat/stream for SSE.
 */
export function subscribe(listener: Listener): () => void {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

/**
 * Publish an anomaly event to all subscribers.
 */
export function publish(event: AnomalyEvent): void {
  _listeners.forEach((l) => {
    try { l(event); } catch { /* swallow per-listener errors */ }
  });
}

export default { subscribe, publish };