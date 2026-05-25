"use client";
// useMissionSimulations.ts - React hook to fetch mission simulation data from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface MissionSimulation {
  id: string;
  mission_id: string;
  status: string;
  started_at: string;
  ended_at: string;
  log: string;
}

export function useMissionSimulations() {
  const [simulations, setSimulations] = useState<MissionSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimulations() {
      setLoading(true);
      const { data, error } = await supabase.from('mission_simulations').select('*');
      if (error) setError(error.message);
      else setSimulations(data || []);
      setLoading(false);
    }
    fetchSimulations();
  }, []);

  return { simulations, loading, error };
}
