// useAccount.ts - React hook to fetch user account/profile from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AccountProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  quota: number;
}

export function useAccount(userId: string) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) setError(error.message);
      else setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}
