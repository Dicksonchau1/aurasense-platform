'use client';

import React, { useEffect, useState } from 'react';
import LineChart from './LineChart';

function FreeRunDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [lastJsonl, setLastJsonl] = useState<string>('');
  const [accretion, setAccretion] = useState<any>(null);
  const [sessionSeries, setSessionSeries] = useState<{ x: number; y: number }[]>([]);
  const [uncertaintySeries, setUncertaintySeries] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch('/api/rehearse/free-run-status');
      setStatus(await res.json());
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/free_run.jsonl')
      .then(r => r.text())
      .then(t => {
        const lines = t.trim().split('\n');
        setLastJsonl(lines[lines.length - 1] || '');
        // Parse all lines for chart data
        const sessionData: { x: number; y: number }[] = [];
        const uncertaintyData: { x: number; y: number }[] = [];
        lines.forEach((line, i) => {
          try {
            const obj = JSON.parse(line);
            sessionData.push({ x: i, y: obj.session_ticks || 0 });
            if (obj.mean_uncertainty !== undefined) {
              uncertaintyData.push({ x: i, y: obj.mean_uncertainty });
            }
          } catch {}
        });
        setSessionSeries(sessionData);
        setUncertaintySeries(uncertaintyData);
      })
      .catch(() => setLastJsonl(''));
  }, [status]);

  useEffect(() => {
    fetch('/accretion_summary.json')
      .then(r => r.json())
      .then(setAccretion)
      .catch(() => setAccretion(null));
  }, [status]);

  if (!status) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Free Run Dashboard</h2>
      <div>Sessions run: {status.session_count}</div>
      <div>Contributions: {status.total_contributions}</div>
      <div>Hours elapsed: {status.hours_elapsed}</div>
      <div>Current H3 cell: {status.current_h3_cell}</div>
      <div>Mean uncertainty: {status.mean_uncertainty_latest}</div>
      <div style={{ color: status.mean_uncertainty_latest < 1 ? 'green' : 'black' }}>
        {status.mean_uncertainty_latest < 1 ? 'ATLAS is learning' : 'Learning...'}
      </div>
      <div style={{ margin: '24px 0', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <LineChart
            data={sessionSeries}
            label="Session Ticks per Run"
            color="#0074D9"
            yLabel="Ticks"
            xLabel="Session #"
          />
          <div style={{ color: '#0074D9', fontSize: 12, marginTop: 4 }}>â–  Session Ticks</div>
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <LineChart
            data={uncertaintySeries}
            label="Mean Uncertainty Trend"
            color="#FF4136"
            yLabel="Uncertainty"
            xLabel="Session #"
          />
          <div style={{ color: '#FF4136', fontSize: 12, marginTop: 4 }}>â–  Mean Uncertainty</div>
        </div>
      </div>
      {accretion && (
        <div style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <h4>Accretion Summary</h4>
          <div>Total contributions: {accretion.total_contributions}</div>
          <div>H3 cells: {accretion.h3_cells?.length}</div>
          <div>Uncertainty reduction: {accretion.uncertainty_reduction?.first_10pct?.toFixed(3)} â†’ {accretion.uncertainty_reduction?.last_10pct?.toFixed(3)}</div>
        </div>
      )}
      <h4>Last JSONL entry</h4>
      <pre style={{ background: '#eee', padding: 8, fontSize: 12 }}>{lastJsonl}</pre>
    </div>
  );
}

export default FreeRunDashboard;
