"use client";
// useDrones.ts - React hook to fetch drones from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Drone {
  id: string;
  status: string;
  nerm: string;
  battery: number;
  location: string;
}

export function useDrones() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrones() {
      setLoading(true);
      const { data, error } = await supabase.from('drones').select('*');
      if (error) setError(error.message);
      else setDrones(data || []);
      setLoading(false);
    }
    fetchDrones();
  }, []);

  return { drones, loading, error };
}
