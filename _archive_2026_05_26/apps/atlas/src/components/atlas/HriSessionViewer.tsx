import React from 'react';
import { HriSessionState } from 'hri-core';

export function HriSessionViewer({ session }: { session: HriSessionState }) {
  return (
    <div>
      <h3>HRI Session Viewer</h3>
      <div>Session ID: {session.sessionId}</div>
      <div>Status: {session.status}</div>
      <div>Role: {session.role}</div>
      <div>Timeline Events: {session.timeline.length}</div>
      <div>Current Recommendation: {session.currentRecommendation?.intent?.type || 'None'}</div>
    </div>
  );
}
