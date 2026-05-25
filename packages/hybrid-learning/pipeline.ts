// Ingestion pipeline for learning events
import { LearningEvent, AdaptationCandidate } from './models';
import { SubstrateClient } from 'nepa-substrate';

// Example: substrate client usage for future integration
// const substrate = new SubstrateClient({});
// await substrate.connect();
// substrate.status().then(status => console.log('Substrate status:', status));

const learningEventBuffer: LearningEvent[] = [];
const adaptationCandidates: AdaptationCandidate[] = [];

export function ingestLearningEvent(event: LearningEvent) {
  learningEventBuffer.push(event);
  // Normalize event into adaptation candidate
  const candidate: AdaptationCandidate = {
    event,
    normalized: normalizeEvent(event),
    source: event.channel,
  };
  adaptationCandidates.push(candidate);
}

function normalizeEvent(event: LearningEvent): any {
  // Domain-specific normalization logic
  return event.payload;
}

export function getAdaptationCandidates(sessionId: string): AdaptationCandidate[] {
  return adaptationCandidates.filter(c => c.event.sessionId === sessionId);
}
