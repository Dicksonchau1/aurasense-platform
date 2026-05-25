const adaptationTracesDb = [];
export function saveAdaptationTrace(trace) {
    adaptationTracesDb.push(trace);
}
export function getTracesBySession(sessionId) {
    return adaptationTracesDb.filter(t => t.sessionId === sessionId);
}
