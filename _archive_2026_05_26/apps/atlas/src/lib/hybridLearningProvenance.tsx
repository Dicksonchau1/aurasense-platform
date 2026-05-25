// Read-only provenance display for Atlas
import React from 'react';
import { getAdaptationTraces } from 'packages/hybrid-learning';

export function HybridLearningProvenance({ sessionId, recommendationId }: { sessionId: string, recommendationId: string }) {
  const traces = getAdaptationTraces(sessionId).filter(t => t.candidate.event.payload.recommendationId === recommendationId);
  if (traces.length === 0) return <span>Baseline</span>;
  const trace = traces[0];
  return (
    <span title={trace.decision.rationale}>
      Adapted (Trust: {trace.decision.score}, Source: {trace.candidate.source})
    </span>
  );
}
