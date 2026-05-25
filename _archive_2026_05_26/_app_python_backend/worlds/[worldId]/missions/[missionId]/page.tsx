"use client";
import { notFound } from 'next/navigation';
import { useMission } from '@/hooks/use-mission';
import { useMissionEvents } from '@/hooks/use-mission-events';
import { useState } from 'react';
import { useNotification } from '@/components/notification-context';

export default function MissionDetailPage({ params }: { params: { worldId: string; missionId: string } }) {
  const { mission, loading, error } = useMission(params.missionId);
  const { events, loading: eventsLoading, error: eventsError } = useMissionEvents(params.missionId);
  const [actionLoading, setActionLoading] = useState(false);
  const [customCmd, setCustomCmd] = useState('');
  const [customCmdLoading, setCustomCmdLoading] = useState(false);
  const { showNotification } = useNotification();

  async function handleAbort() {
    setActionLoading(true);
    try {
      await fetch(`/aurasense-platform/api/missions/${params.missionId}/abort`, { method: 'POST' });
      showNotification({ type: 'success', message: 'Mission abort requested.' });
    } catch {
      showNotification({ type: 'error', message: 'Failed to abort mission.' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this mission? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await fetch(`/aurasense-platform/api/missions/${params.missionId}`, { method: 'DELETE' });
      showNotification({ type: 'success', message: 'Mission deleted.' });
    } catch {
      showNotification({ type: 'error', message: 'Failed to delete mission.' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCustomCommand() {
    if (!customCmd.trim()) return;
    setCustomCmdLoading(true);
    try {
      await fetch(`/aurasense-platform/api/missions/${params.missionId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: customCmd }),
      });
      showNotification({ type: 'success', message: `Custom command '${customCmd}' sent.` });
      setCustomCmd('');
    } catch {
      showNotification({ type: 'error', message: 'Failed to send custom command.' });
    } finally {
      setCustomCmdLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="atlas-panel p-6 text-slate-400 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="atlas-panel p-5 sm:p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">Mission Event Log</h2>
          {eventsLoading && <div className="text-slate-400">Loading events...</div>}
          {eventsError && <div className="text-rose-300">Error loading events: {eventsError}</div>}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="text-slate-400">No events found for this mission.</div>
          )}
          {!eventsLoading && !eventsError && events.length > 0 && (
            <ul className="divide-y divide-white/10 text-xs">
              {events.map(ev => (
                <li key={ev.id} className="py-2 flex gap-3 items-center">
                  <span className="text-slate-400 min-w-[120px]">{new Date(ev.timestamp).toLocaleString()}</span>
                  <span className="font-semibold text-white">{ev.type}</span>
                  <span className="text-slate-300">{ev.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        Loading mission...
      </section>
    );
  }
  if (error || !mission) return notFound();

  return (
    <section className="space-y-6">
      <div className="atlas-panel p-6 sm:p-8">
        <p className="atlas-label">Mission detail</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{mission.label || mission.id}</h1>
        <p className="mt-2 text-sm text-slate-400">State: {mission.state}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="atlas-label">Created</p>
            <p className="mt-2 text-white">{new Date(mission.created_at).toLocaleString()}</p>
          </div>
          {mission.completed_at && (
            <div>
              <p className="atlas-label">Completed</p>
              <p className="mt-2 text-white">{new Date(mission.completed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <p className="atlas-label">Parameters</p>
          <pre className="mt-2 bg-white/[0.03] p-3 rounded-xl text-slate-200 text-xs overflow-x-auto">{JSON.stringify(mission.params, null, 2)}</pre>
        </div>
        {mission.report_url && (
          <div className="mt-6">
            <a href={mission.report_url} target="_blank" rel="noopener" className="atlas-button-secondary">View Report</a>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {(mission.state === 'in_flight' || mission.state === 'standby') && (
            <button
              className="atlas-button-primary"
              onClick={handleAbort}
              disabled={actionLoading}
            >
              {actionLoading ? 'Aborting...' : 'Abort Mission'}
            </button>
          )}
          <button
            className="atlas-button-secondary"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting...' : 'Delete Mission'}
          </button>
          <form
            onSubmit={e => { e.preventDefault(); handleCustomCommand(); }}
            className="flex flex-col sm:flex-row gap-2 items-start sm:items-end"
          >
            <label className="flex flex-col sm:flex-row items-start sm:items-end w-full">
              <span className="sr-only">Custom Command</span>
              <input
                type="text"
                value={customCmd}
                onChange={e => setCustomCmd(e.target.value)}
                placeholder="Enter custom command"
                className="ml-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none"
                disabled={customCmdLoading}
              />
            </label>
            <button
              type="submit"
              className="atlas-button-secondary"
              disabled={customCmdLoading || !customCmd.trim()}
            >
              {customCmdLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          
        </div>
      </div>
    </section>
  );
}

