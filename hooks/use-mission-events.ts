import { useEffect, useState } from 'react';

export interface MissionEvent {
  id: string;
  mission_id: string;
  timestamp: string;
  type: string;
  message: string;
}

export function useMissionEvents(missionId: string) {
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/aurasense-platform/api/missions/${missionId}/events`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch mission events');
        return res.json();
      })
      .then(data => {
        if (!active) return;
        setEvents(data);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, [missionId]);

  return { events, loading, error };
}
