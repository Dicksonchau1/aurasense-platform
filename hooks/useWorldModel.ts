// useWorldModel.ts - React hook to fetch world model data from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface WorldModel {
  id: string;
  name: string;
  terrain_url: string;
  zones: string; // JSON or stringified array
  updated_at: string;
}

export function useWorldModel() {
  const [models, setModels] = useState<WorldModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      const { data, error } = await supabase.from('world_model').select('*');
      if (error) setError(error.message);
      else setModels(data || []);
      setLoading(false);
    }
    fetchModels();
  }, []);

  return { models, loading, error };
}
