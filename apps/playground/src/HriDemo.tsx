import React, { useState } from 'react';
import { useHriSession, getCurrentRecommendation, HriRole } from 'hri-core';
import { startHriSessionTyped, appendTimelineEvent, recordOperatorDecision, recordRecommendation } from './lib/hriAudit';
import type { HriSessionData } from './lib/HriSessionData';

export function HriDemo() {
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<string>('idle');
  const [timelineMsg, setTimelineMsg] = useState<string>('');
  const [decisionType, setDecisionType] = useState<string>('');
  const [recommendationType, setRecommendationType] = useState<string>('');
  const [recommendationSummary, setRecommendationSummary] = useState<string>('');
  const [recommendationPayload, setRecommendationPayload] = useState<string>('');

  // Demo: useHriSession is still used for local state, but API is used for persistence
  const [state, dispatch] = useHriSession(sessionId || 'demo-session', 'operator', new Date().toISOString());

  async function handleCreateSession() {
    const data: HriSessionData = {
      app_context: 'playground-demo',
      agent_id: 'demo-agent',
      status: 'active',
    };
    setSessionStatus('creating...');
    const res = await startHriSessionTyped(data);
    if (res?.data && res.data[0]?.id) {
      setSessionId(res.data[0].id);
      setSessionStatus('active');
    } else {
      setSessionStatus('error');
    }
  }

  async function handleLogTimelineEvent() {
    if (!sessionId) return;
    await appendTimelineEvent(sessionId, {
      event_type: 'demo_event',
      event_payload: { message: timelineMsg, timestamp: new Date().toISOString() },
    });
    setTimelineMsg('');
  }

  async function handleOperatorDecision() {
    if (!sessionId) return;
    await recordOperatorDecision(sessionId, {
      decision_type: decisionType,
      rationale: 'Demo rationale',
    });
    setDecisionType('');
  }

  async function handleRecommendation() {
    if (!sessionId) return;
    await recordRecommendation(sessionId, {
      recommendation_type: recommendationType,
      perception_summary: { summary: recommendationSummary },
      recommendation_payload: { payload: recommendationPayload },
    });
    setRecommendationType('');
    setRecommendationSummary('');
    setRecommendationPayload('');
  }

  return (
    <div>
      <h2>HRI Session Demo</h2>
      <div>Status: {sessionStatus}</div>
      <button onClick={handleCreateSession} disabled={!!sessionId || sessionStatus === 'creating...'}>
        Create HRI Session
      </button>
      {sessionId && (
        <>
          <div>Session ID: {sessionId}</div>
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Timeline event message"
              value={timelineMsg}
              onChange={e => setTimelineMsg(e.target.value)}
            />
            <button onClick={handleLogTimelineEvent} disabled={!timelineMsg}>Log Timeline Event</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Operator decision type"
              value={decisionType}
              onChange={e => setDecisionType(e.target.value)}
            />
            <button onClick={handleOperatorDecision} disabled={!decisionType}>Record Operator Decision</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Recommendation type"
              value={recommendationType}
              onChange={e => setRecommendationType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Perception summary"
              value={recommendationSummary}
              onChange={e => setRecommendationSummary(e.target.value)}
            />
            <input
              type="text"
              placeholder="Recommendation payload"
              value={recommendationPayload}
              onChange={e => setRecommendationPayload(e.target.value)}
            />
            <button onClick={handleRecommendation} disabled={!recommendationType || !recommendationSummary || !recommendationPayload}>
              Record Recommendation
            </button>
          </div>
        </>
      )}
      <div style={{ marginTop: 32 }}>
        <div>Current Recommendation: {getCurrentRecommendation(state)?.intent?.type || 'None'}</div>
      </div>
    </div>
  );
}
