import { useEffect, useState } from 'react';
import { rehearseApi } from '@/lib/rehearse-api';
import { Mission } from '@/lib/rehearse-types';

export function useMissionsByBuilding(mbisId: string) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    rehearseApi.getMissionsByBuilding(mbisId)
      .then((result) => {
        if (!active) return;
        setMissions(result);
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
  }, [mbisId]);

  return { missions, loading, error };
}
