import { Agent, DashboardSummary, Run, World } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const atlasApi = {
  getDashboardSummary: () => request<DashboardSummary>('/api/dashboard/summary'),
  getWorlds: () => request<World[]>('/api/worlds'),
  getWorldById: (worldId: string) => request<World>(`/api/worlds/${worldId}`),
  getAgentsByWorld: (worldId: string) => request<Agent[]>(`/api/worlds/${worldId}/agents`),
  getRuns: () => request<Run[]>('/api/runs'),
  getRunsByWorld: (worldId: string) => request<Run[]>(`/api/worlds/${worldId}/runs`),
  getRunById: (runId: string) => request<Run>(`/api/runs/${runId}`),
  triggerRun: (worldId: string, flowName: string) =>
    request<Run>(`/api/worlds/${worldId}/runs`, {
      method: 'POST',
      body: JSON.stringify({ flowName }),
    }),
};
