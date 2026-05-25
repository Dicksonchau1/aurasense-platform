'use client';

import { useEffect, useState } from 'react';
import { atlasApi } from '@/lib/api';
import { Agent, Run, World } from '@/lib/types';

export function useWorldDetail(worldId: string) {
  const [world, setWorld] = useState<World | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      atlasApi.getWorldById(worldId),
      atlasApi.getAgentsByWorld(worldId),
      atlasApi.getRunsByWorld(worldId),
    ])
      .then(([worldData, agentData, runData]) => {
        if (!active) return;
        setWorld(worldData);
        setAgents(agentData);
        setRuns(runData);
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
  }, [worldId]);

  return { world, agents, runs, loading, error };
}
