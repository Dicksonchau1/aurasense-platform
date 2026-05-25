"use client";
// useMissions.ts - React hook to fetch missions from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Mission {
  id: string;
  name: string;
  status: string;
  assigned_drone: string;
  start_time: string;
  end_time: string;
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMissions() {
      setLoading(true);
      const { data, error } = await supabase.from('missions').select('*');
      if (error) setError(error.message);
      else setMissions(data || []);
      setLoading(false);
    }
    fetchMissions();
  }, []);

  return { missions, loading, error };
}
