'use client';

import { useEffect, useState } from 'react';
import { rehearseApi } from '@/lib/rehearse-api';
import { Mission } from '@/lib/rehearse-types';

export function useMission(missionId: string) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    rehearseApi.getMission(missionId)
      .then((result) => {
        if (!active) return;
        setMission(result);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [missionId]);

  return { mission, loading, error };
}
