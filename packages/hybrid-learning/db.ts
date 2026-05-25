// Persistence for adaptation traces
import { AdaptationTrace } from './models';

const adaptationTracesDb: AdaptationTrace[] = [];

export function saveAdaptationTrace(trace: AdaptationTrace) {
  adaptationTracesDb.push(trace);
}

export function getTracesBySession(sessionId: string): AdaptationTrace[] {
  return adaptationTracesDb.filter(t => t.sessionId === sessionId);
}
