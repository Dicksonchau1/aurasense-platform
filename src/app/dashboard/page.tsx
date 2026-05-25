'use client';

import React, { useState } from 'react';
import { InvoicePanel } from '@/atlas/billing/InvoicePanel';

export default function DashboardPage() {
  // Example: hardcoded siteId, replace with actual logic as needed
  const [siteId, setSiteId] = useState('SITE123');
  const [periodStart, setPeriodStart] = useState('2024-01-01');
  const [periodEnd, setPeriodEnd] = useState('2024-03-31');
  const [requestedBy, setRequestedBy] = useState({ id: 'admin1', name: 'Admin User', role: 'admin' });
  const [downloadUrl, setDownloadUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleExportCompliance(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setDownloadUrl(null);
    try {
      const res = await fetch('/api/compliance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, periodStart, periodEnd, requestedBy }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Compliance Export</h2>
        <form onSubmit={handleExportCompliance} className="space-y-2">
          <div>
            <label>Site ID: <input value={siteId} onChange={e=>setSiteId(e.target.value)} className="border px-2" /></label>
          </div>
          <div>
            <label>Period Start: <input type="date" value={periodStart} onChange={e=>setPeriodStart(e.target.value)} className="border px-2" /></label>
          </div>
          <div>
            <label>Period End: <input type="date" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)} className="border px-2" /></label>
          </div>
          <div>
            <label>Requested By: <input value={requestedBy.name} onChange={e=>setRequestedBy({ ...requestedBy, name: e.target.value })} className="border px-2" /></label>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>{loading ? 'Exporting...' : 'Export Compliance PDF'}</button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {downloadUrl && <a href={downloadUrl} download={`ATLAS_Compliance_${siteId}_${periodStart.slice(0,7)}.pdf`} className="block mt-2 text-blue-700 underline">Download PDF</a>}
      </section>
      <section>
        <InvoicePanel siteId={siteId} />
      </section>
    </div>
  );
}