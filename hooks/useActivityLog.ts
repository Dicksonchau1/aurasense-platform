"use client";
// useActivityLog.ts - React hook to fetch activity log from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ActivityLogEntry {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  user_id: string;
}

export function useActivityLog() {
  const [log, setLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLog() {
      setLoading(true);
      const { data, error } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setLog(data || []);
      setLoading(false);
    }
    fetchLog();
  }, []);

  return { log, loading, error };
}
