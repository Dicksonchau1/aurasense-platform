"use client";
// LearningDashboard - UI for learning loop model management
import { useState, useEffect } from 'react';
import { startTraining, listModels, promoteModel, rollbackModel, getShadowReport } from '../lib/api/learningLoop';

export default function LearningDashboard() {
  const [models, setModels] = useState<any[]>([]);
  const [shadowReport, setShadowReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listModels().then(setModels);
    getShadowReport().then(setShadowReport);
  }, []);

  const handleTrain = async () => {
    setLoading(true);
    try {
      await startTraining({});
      setModels(await listModels());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handlePromote = async (id: string) => {
    setLoading(true);
    try {
      await promoteModel(id);
      setModels(await listModels());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleRollback = async (id: string) => {
    setLoading(true);
    try {
      await rollbackModel(id);
      setModels(await listModels());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="font-bold mb-4">Learning Loop</h2>
      <button className="btn btn-primary mb-4" onClick={handleTrain} disabled={loading}>Start Training</button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <h3 className="font-semibold">Models</h3>
        <ul>
          {models.map((m, i) => (
            <li key={i} className="mb-2">
              <span className="font-mono">{m.id}</span> - {m.status}
              <button className="btn btn-xs btn-success ml-2" onClick={() => handlePromote(m.id)} disabled={loading}>Promote</button>
              <button className="btn btn-xs btn-warning ml-2" onClick={() => handleRollback(m.id)} disabled={loading}>Rollback</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Shadow Report</h3>
        <pre>{shadowReport ? JSON.stringify(shadowReport, null, 2) : 'Loading...'}</pre>
      </div>
    </div>
  );
}
