"use client";
// useSettings.ts - React hook to fetch settings/integrations from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Settings {
  id: string;
  org_name: string;
  api_key: string;
  integrations: string; // JSON or stringified array
  updated_at: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) setError(error.message);
      else setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  return { settings, loading, error };
}
