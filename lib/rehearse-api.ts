import {
  AiModelInfo,
  BuildingPage,
  MBISBuilding,
  Mission,
  MissionCreate,
  MissionPlan,
  MissionValidation,
  WeatherNow,
} from '@/lib/rehearse-types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.aurasensehk.com/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('atlas_token') : null;

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const rehearseApi = {
  getBuildings: (params?: { q?: string; bbox?: string; limit?: number; cursor?: string }) => {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.bbox) search.set('bbox', params.bbox);
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.cursor) search.set('cursor', params.cursor);
    const query = search.toString();
    return request<BuildingPage>(`/buildings${query ? `?${query}` : ''}`);
  },
  getBuilding: (mbisId: string) => request<MBISBuilding>(`/buildings/${mbisId}`),
  // Fetch all missions for a given building (mbis_id)
  getMissionsByBuilding: (mbisId: string) => request<Mission[]>(`/missions?mbis_id=${mbisId}`),
  createMission: (payload: MissionCreate) =>
    request<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  validateMission: (payload: MissionPlan) =>
    request<MissionValidation>('/missions/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMission: (missionId: string) => request<Mission>(`/missions/${missionId}`),
  getModelInfo: () => request<AiModelInfo>('/ai/model-info'),
  getWeatherCurrent: (lat: number, lng: number) =>
    request<WeatherNow>(`/weather/current?lat=${lat}&lng=${lng}`),
};
