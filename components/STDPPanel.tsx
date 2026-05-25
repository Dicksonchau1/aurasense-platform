// STDPPanel - UI for STDP feedback, metrics, and retrain
"use client";
import { useState, useEffect } from 'react';
import { submitFeedback, listFeedback, retrainModel, getMetrics } from '../lib/api/stdp';

export default function STDPPanel() {
  const [feedback, setFeedback] = useState('');
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFeedback().then(setFeedbackList);
    getMetrics().then(setMetrics);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitFeedback({ feedback });
      setFeedback('');
      setFeedbackList(await listFeedback());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleRetrain = async () => {
    setLoading(true);
    try {
      await retrainModel();
      setMetrics(await getMetrics());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="font-bold mb-4">STDP Feedback</h2>
      <textarea className="form-input w-full mb-2" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Enter feedback..." />
      <button className="btn btn-primary mb-4" onClick={handleSubmit} disabled={loading}>Submit Feedback</button>
      <button className="btn btn-secondary mb-4 ml-2" onClick={handleRetrain} disabled={loading}>Retrain Model</button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <h3 className="font-semibold">Feedback List</h3>
        <ul>{feedbackList.map((f, i) => <li key={i}>{f.feedback}</li>)}</ul>
      </div>
      <div>
        <h3 className="font-semibold">Metrics</h3>
        <pre>{metrics ? JSON.stringify(metrics, null, 2) : 'Loading...'}</pre>
      </div>
    </div>
  );
}
