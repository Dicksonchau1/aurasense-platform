"use client";
// useBilling.ts - React hook to fetch billing and plan data from Supabase
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  quota: number;
  features: string; // JSON or stringified array
}

export function useBilling() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      const { data, error } = await supabase.from('billing_plans').select('*');
      if (error) setError(error.message);
      else setPlans(data || []);
      setLoading(false);
    }
    fetchPlans();
  }, []);

  return { plans, loading, error };
}
