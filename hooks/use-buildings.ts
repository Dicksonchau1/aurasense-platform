'use client';

import { useEffect, useState } from 'react';
import { rehearseApi } from '@/lib/rehearse-api';
import { BuildingPage } from '@/lib/rehearse-types';

export function useBuildings(q?: string) {
  const [data, setData] = useState<BuildingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    rehearseApi.getBuildings({ q, limit: 24 })
      .then((result) => {
        if (!active) return;
        setData(result);
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
  }, [q]);

  return { data, loading, error };
}
