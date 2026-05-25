'use client';
// Inspection panel for hybrid learning in playground
import React, { useState } from 'react';
import { getAdaptationCandidates, getAdaptationTraces } from 'hybrid-learning';

export function HybridLearningPanel({ sessionId }: { sessionId: string }) {
  const [candidates, setCandidates] = useState(() => getAdaptationCandidates(sessionId));
  const [traces, setTraces] = useState(() => getAdaptationTraces(sessionId));

  return (
    <div>
      <h2>Hybrid Learning Inspection</h2>
      <h3>Adaptation Candidates</h3>
      <ul>
        {candidates.map(c => (
          <li key={c.event.id}>{JSON.stringify(c)}</li>
        ))}
      </ul>
      <h3>Adaptation Traces</h3>
      <ul>
        {traces.map(t => (
          <li key={t.id}>{JSON.stringify(t)}</li>
        ))}
      </ul>
    </div>
  );
}

