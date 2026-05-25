import React from 'react';
import { HybridLearningPanel } from '../hybridLearningPanel';

export default function PlaygroundPage() {
  // For demo, use a static sessionId. In real app, wire to session selection.
  const sessionId = 'demo-session';
  return (
    <main>
      <h1>Playground</h1>
      <HybridLearningPanel sessionId={sessionId} />
    </main>
  );
}
