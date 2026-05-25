// RuntimeControl - UI for runtime analysis and live spike data
"use client";
import { useState, useEffect } from 'react';
import { analyzeFrame, getRuntimeHealth, getRuntimeMetrics, getLiveSpikeStream } from '../lib/api/runtime';

export default function RuntimeControl() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [spikeData, setSpikeData] = useState<string[]>([]);
  const [frame, setFrame] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRuntimeHealth().then(setHealth);
    getRuntimeMetrics().then(setMetrics);
    const ws = getLiveSpikeStream();
    ws.onmessage = (e) => setSpikeData(d => [...d, e.data]);
    ws.onerror = (e) => setError('WebSocket error');
    return () => ws.close();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await analyzeFrame({ frame });
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="font-bold mb-4">Runtime Control</h2>
      <input className="form-input w-full mb-2" value={frame} onChange={e => setFrame(e.target.value)} placeholder="Frame data..." />
      <button className="btn btn-primary mb-4" onClick={handleAnalyze} disabled={loading}>Analyze Frame</button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <h3 className="font-semibold">Health</h3>
        <pre>{health ? JSON.stringify(health, null, 2) : 'Loading...'}</pre>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Metrics</h3>
        <pre>{metrics ? JSON.stringify(metrics, null, 2) : 'Loading...'}</pre>
      </div>
      <div>
        <h3 className="font-semibold">Live Spike Data</h3>
        <ul className="h-32 overflow-y-auto bg-gray-100 p-2 rounded">
          {spikeData.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}
