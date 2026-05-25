const learningEventBuffer = [];
const adaptationCandidates = [];
export function ingestLearningEvent(event) {
    learningEventBuffer.push(event);
    // Normalize event into adaptation candidate
    const candidate = {
        event,
        normalized: normalizeEvent(event),
        source: event.channel,
    };
    adaptationCandidates.push(candidate);
}
function normalizeEvent(event) {
    // Domain-specific normalization logic
    return event.payload;
}
export function getAdaptationCandidates(sessionId) {
    return adaptationCandidates.filter(c => c.event.sessionId === sessionId);
}
