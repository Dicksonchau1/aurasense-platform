"use client";
// useDataExports.ts - React hook to fetch data export/download history from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DataExport {
  id: string;
  file_url: string;
  created_at: string;
  user_id: string;
}

export function useDataExports() {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExports() {
      setLoading(true);
      const { data, error } = await supabase.from('data_exports').select('*').order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setExports(data || []);
      setLoading(false);
    }
    fetchExports();
  }, []);

  return { exports, loading, error };
}
