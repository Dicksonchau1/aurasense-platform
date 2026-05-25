'use client';
// STUB - useMissions hook. Wire to /api/atlas/missions when route exists.
import { useEffect, useState } from 'react';

export interface Mission {
  id: string;
  name: string;
  status: 'planned' | 'active' | 'complete' | 'aborted';
  assigned_drone: string;
  start: string;
  end: string | null;
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Demo data until real API is wired
        if (!cancelled) {
          setMissions([
            { id: 'MSN-001', name: 'Facade scan — Block A', status: 'complete', assigned_drone: 'DRN-12', start: '2026-05-24T09:00:00Z', end: '2026-05-24T09:42:00Z' },
            { id: 'MSN-002', name: 'Confined-space inspection — Tunnel 3', status: 'active', assigned_drone: 'DRN-07', start: '2026-05-26T02:15:00Z', end: null },
            { id: 'MSN-003', name: 'Perimeter sweep — Sector 4', status: 'planned', assigned_drone: 'DRN-03', start: '2026-05-26T08:00:00Z', end: null },
          ]);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { missions, loading, error };
}

export default useMissions;