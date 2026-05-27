// In-memory pub/sub for coaching prompts. Browser subscribes via SSE,
// server publishes after each orchestrator tick.

import type { CoachingPrompt } from "./types";

type Subscriber = (p: CoachingPrompt) => void;
const subs = new Map<string, Set<Subscriber>>();

export function subscribe(sessionId: string, cb: Subscriber): () => void {
  if (!subs.has(sessionId)) subs.set(sessionId, new Set());
  subs.get(sessionId)!.add(cb);
  return () => {
    subs.get(sessionId)?.delete(cb);
    if (subs.get(sessionId)?.size === 0) subs.delete(sessionId);
  };
}

export function publish(sessionId: string, p: CoachingPrompt): void {
  subs.get(sessionId)?.forEach((cb) => { try { cb(p); } catch {} });
}