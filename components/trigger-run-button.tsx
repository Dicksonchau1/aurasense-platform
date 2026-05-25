'use client';

import { useState } from 'react';
import { atlasApi } from '@/lib/api';

export function TriggerRunButton({ worldId, flowName = 'default-flow' }: { worldId: string; flowName?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    try {
      setLoading(true);
      setMessage(null);
      const run = await atlasApi.triggerRun(worldId, flowName);
      setMessage(`Run ${run.id} started`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to start run');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Starting...' : 'Trigger run'}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
