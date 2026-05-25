'use client';

import { useEffect, useState } from 'react';
import { rehearseApi } from '@/lib/rehearse-api';
import { MBISBuilding } from '@/lib/rehearse-types';

export function useBuilding(mbisId: string) {
  const [building, setBuilding] = useState<MBISBuilding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    rehearseApi.getBuilding(mbisId)
      .then((result) => {
        if (!active) return;
        setBuilding(result);
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
  }, [mbisId]);

  return { building, loading, error };
}
