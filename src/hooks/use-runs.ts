import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'http://127.0.0.1:8000/api/v1';

async function fetchRuns() {
  const res = await fetch(`${API_BASE}/runs/`);
  if (!res.ok) throw new Error('Failed to fetch runs');
  return res.json();
}

export function useRuns() {
  return useQuery({
    queryKey: ['runs'],
    queryFn: fetchRuns,
  });
}
