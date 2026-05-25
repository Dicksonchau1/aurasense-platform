// WorldModelViewer - UI for world model state, history, simulation
"use client";
import { useState, useEffect } from 'react';
import { getWorldState, getWorldHistory, simulateWorld } from '../lib/api/worldModel';

export default function WorldModelViewer() {
  const [state, setState] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorldState().then(setState);
    getWorldHistory().then(setHistory);
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      setSimResult(await simulateWorld({}));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="font-bold mb-4">World Model</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Current State</h3>
        <pre>{state ? JSON.stringify(state, null, 2) : 'Loading...'}</pre>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">History</h3>
        <ul>{history.map((h, i) => <li key={i}>{JSON.stringify(h)}</li>)}</ul>
      </div>
      <button className="btn btn-primary mb-4" onClick={handleSimulate} disabled={loading}>Simulate</button>
      <div>
        <h3 className="font-semibold">Simulation Result</h3>
        <pre>{simResult ? JSON.stringify(simResult, null, 2) : 'No simulation run yet.'}</pre>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
    </div>
  );
}
