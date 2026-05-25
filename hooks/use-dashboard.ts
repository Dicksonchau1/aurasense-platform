'use client';
import useSWR from 'swr';

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR('/aurasense-platform/api/kpis/today', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  });
  return {
    stats: data,
    isLoading,
    isError: !!error,
  };
}

export function useRecentRuns() {
  const { data, error, isLoading } = useSWR('/aurasense-platform/api/nepa/missions/active', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recent runs');
    return res.json();
  });
  return {
    runs: data,
    isLoading,
    isError: !!error,
  };
}
