'use client';

import useSWR from 'swr';

export function useWorlds() {
  const { data, error, isLoading } = useSWR('/aurasense-platform/api/atlas/registry', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch worlds');
    return res.json();
  });
  // Map the registry data to a World-like structure for display
  const mapped = (data || []).map((item: any, idx: number) => ({
    id: `world-${idx}`,
    slug: item.title?.toLowerCase().replace(/\s+/g, '-') || `world-${idx}`,
    name: item.title,
    description: item.sub,
    status: 'active',
    region: 'N/A',
    updatedAt: new Date().toISOString(),
    agentCount: 1,
    activeRunCount: 0,
    tags: [item.icon],
  }));
  return {
    data: mapped,
    loading: isLoading,
    error: error ? error.message : null,
  };
}
