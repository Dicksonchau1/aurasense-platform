export async function updateWorld(id: number, data: { name: string; description?: string }) {
  const res = await fetch(`${API_BASE}/worlds/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update world');
  return res.json();
}

export async function deleteWorld(id: number) {
  const res = await fetch(`${API_BASE}/worlds/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete world');
  return true;
}
const API_BASE = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchWorlds() {
  const res = await fetch(`${API_BASE}/worlds/`);
  if (!res.ok) throw new Error('Failed to fetch worlds');
  return res.json();
}

export async function createWorld(data: { name: string; description?: string }) {
  const res = await fetch(`${API_BASE}/worlds/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create world');
  return res.json();
}
