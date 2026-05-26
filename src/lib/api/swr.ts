// SWR fetcher + helpers for ATLAS dashboard hooks.
// Safe to drop in: no app-specific imports.

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, body, `${res.status} ${res.statusText} @ ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errBody: unknown = null;
    try { errBody = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, errBody, `${res.status} ${res.statusText} @ ${url}`);
  }
  return res.json() as Promise<T>;
}

export const swrDefaultConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  shouldRetryOnError: false,
} as const;

export const swrLiveConfig = {
  ...swrDefaultConfig,
  refreshInterval: 5000,
} as const;