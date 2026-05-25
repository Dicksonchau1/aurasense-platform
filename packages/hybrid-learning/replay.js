import { getAdaptationCandidates } from './pipeline';
import { scoreAdaptationCandidates } from './scoring';
import { saveAdaptationTrace, getTracesBySession } from './db';
export function replaySession(sessionId) {
    const candidates = getAdaptationCandidates(sessionId);
    const decisions = scoreAdaptationCandidates(candidates);
    // Persist traces
    decisions.forEach(decision => {
        const trace = {
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
export function getAdaptationTraces(sessionId) {
    return getTracesBySession(sessionId);
}
