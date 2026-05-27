// ATLAS API utilities for React frontend
// Handles bearer token, typed responses, and error handling

export async function fetchWithAuth<T>(url: string, token: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data;
}

// React hooks for each endpoint
import { useCallback, useState } from 'react';

export function useMavlink(token: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string|null>(null);
  const fetchMavlink = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchWithAuth('/api/atlas/mavlink', token);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);
  return { data, error, fetchMavlink };
}

export function useDefects(token: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string|null>(null);
  const fetchDefects = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchWithAuth('/api/atlas/defects', token);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);
  return { data, error, fetchDefects };
}

export function useFacade(token: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string|null>(null);
  const fetchFacade = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchWithAuth('/api/atlas/facade', token);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);
  return { data, error, fetchFacade };
}

export function usePhotogrammetry(token: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string|null>(null);
  const fetchPhotogrammetry = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchWithAuth('/api/atlas/photogrammetry', token);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);
  return { data, error, fetchPhotogrammetry };
}
