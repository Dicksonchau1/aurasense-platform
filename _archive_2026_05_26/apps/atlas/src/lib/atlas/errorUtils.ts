// Centralized error logger for UI and API errors
export function logError(error: any, context: string = "") {
  
  if (typeof window !== "undefined" && window.console) {
    // eslint-disable-next-line no-console
    console.error(`[Error]${context ? ` [${context}]` : ""}:`, error);
  }

}


export function getAuthErrorMessage(status: number): string | null {
  if (status === 401) return "You are not authorized. Please log in.";
  if (status === 403) return "You do not have permission to perform this action.";
  return null;
}


export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2, backoff = 500): Promise<Response> {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok && (res.status === 401 || res.status === 403)) {
        // Auth error, do not retry
        return res;
      }
      if (!res.ok && i < retries) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      lastError = e;
      if (i < retries) await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
  throw lastError;
}


export function hasRole(userRoles: string[] = [], required: string | string[]): boolean {
  if (!userRoles) return false;
  if (Array.isArray(required)) return required.some(r => userRoles.includes(r));
  return userRoles.includes(required);
}
