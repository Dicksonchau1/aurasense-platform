// Processors for HRI feedback, world-model enrichment, STDP traces
import { AdaptationCandidate, AdaptationDecision } from './models';
import { WorldModelAdapter, StdpTraceAdapter } from './adapters';

export function processHriFeedback(candidate: AdaptationCandidate): AdaptationDecision {
  // Example: accept if HRI feedback is positive
  const score = candidate.normalized.feedbackScore || 0;
  return {
    candidate,
    decision: score > 0 ? 'accept' : 'defer',
    rationale: 'HRI feedback score',
    score,
  };
}

export function processWorldModel(candidate: AdaptationCandidate): AdaptationDecision {
  const adapter = new WorldModelAdapter();
  const enriched = adapter.enrich(candidate.normalized);
  // Example: accept if world-model confidence is high
  const score = enriched.confidence || 0;
  return {
    candidate,
    decision: score > 0.7 ? 'accept' : 'defer',
    rationale: 'World-model confidence',
    score,
  };
}

export function processStdpTrace(candidate: AdaptationCandidate): AdaptationDecision {
  const adapter = new StdpTraceAdapter();
  const trace = adapter.inspect(candidate.event.id);
  // Example: accept if STDP association delta is significant
  const score = trace.delta || 0;
  return {
    candidate,
    decision: Math.abs(score) > 0.5 ? 'accept' : 'defer',
    rationale: 'STDP association delta',
    score,
  };
}
