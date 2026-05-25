// ATLAS API client for FastAPI backend

const API_BASE = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchMissions() {
  const res = await fetch(`${API_BASE}/missions/`);
  if (!res.ok) throw new Error('Failed to fetch missions');
  return res.json();
}

export async function createMission(data: { name: string; status?: string }) {
  const res = await fetch(`${API_BASE}/missions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create mission');
  return res.json();
}
