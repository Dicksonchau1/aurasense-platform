'use client';

import { useEffect, useState } from 'react';
import { atlasApi } from '@/lib/api';
import { Run } from '@/lib/types';

export function useRun(runId: string) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    atlasApi.getRunById(runId)
      .then((value) => {
        if (!active) return;
        setRun(value);
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
  }, [runId]);

  return { run, loading, error };
}
