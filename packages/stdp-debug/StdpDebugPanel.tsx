import React, { useEffect, useState } from 'react';
import { getStdpDebugger } from '.';
import type { Envelope, AuditEvent, AdaptationTrace } from 'nepa-substrate';

export default function StdpDebugPanel() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [trace, setTrace] = useState<AdaptationTrace | null>(null);
  const [traceId, setTraceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stdp = getStdpDebugger();

  useEffect(() => {
    stdp.connect().catch(e => setError('Failed to connect: ' + e));
    return () => { stdp.disconnect(); };
  }, []);

  const fetchEnvelopes = async () => {
    try {
      setEnvelopes(await stdp.getEnvelopes());
    } catch (e) {
      setError('Failed to fetch envelopes: ' + e);
    }
  };

  const fetchAuditEvents = async () => {
    try {
      setAuditEvents(await stdp.getAuditEvents());
    } catch (e) {
      setError('Failed to fetch audit events: ' + e);
    }
  };

  const fetchTrace = async () => {
    try {
      setTrace(await stdp.inspectTrace(traceId));
    } catch (e) {
      setError('Failed to fetch trace: ' + e);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>STDP Debug Panel</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ margin: '12px 0' }}>
        <button onClick={fetchEnvelopes}>Load Envelopes</button>
        <button onClick={fetchAuditEvents} style={{ marginLeft: 8 }}>Load Audit Events</button>
      </div>
      <div style={{ margin: '12px 0' }}>
        <input
          value={traceId}
          onChange={e => setTraceId(e.target.value)}
          placeholder="Trace ID"
          style={{ marginRight: 8 }}
        />
        <button onClick={fetchTrace}>Inspect Trace</button>
      </div>
      <div style={{ margin: '12px 0' }}>
        <h3>Envelopes</h3>
        <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f8f8f8' }}>{JSON.stringify(envelopes, null, 2)}</pre>
      </div>
      <div style={{ margin: '12px 0' }}>
        <h3>Audit Events</h3>
        <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f8f8f8' }}>{JSON.stringify(auditEvents, null, 2)}</pre>
      </div>
      <div style={{ margin: '12px 0' }}>
        <h3>Adaptation Trace</h3>
        <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f8f8f8' }}>{JSON.stringify(trace, null, 2)}</pre>
      </div>
    </div>
  );
}
