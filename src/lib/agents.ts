const API_BASE = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/agents/`);
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function createAgent(data: { name: string; type?: string }) {
  const res = await fetch(`${API_BASE}/agents/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create agent');
  return res.json();
}
