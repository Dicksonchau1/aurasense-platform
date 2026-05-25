// Replay API/service for session timeline and adaptation candidates
import { LearningEvent, AdaptationCandidate, AdaptationTrace } from './models';
import { getAdaptationCandidates } from './pipeline';
import { scoreAdaptationCandidates } from './scoring';
import { saveAdaptationTrace, getTracesBySession } from './db';

export function replaySession(sessionId: string) {
  const candidates = getAdaptationCandidates(sessionId);
  const decisions = scoreAdaptationCandidates(candidates);
  // Persist traces
  decisions.forEach(decision => {
    const trace: AdaptationTrace = {
      id: `${sessionId}-${decision.candidate.event.id}`,
      sessionId,
      candidate: decision.candidate,
      decision,
      timestamp: Date.now(),
    };
    saveAdaptationTrace(trace);
  });
  return decisions;
}

export function getAdaptationTraces(sessionId: string): AdaptationTrace[] {
  return getTracesBySession(sessionId);
}
