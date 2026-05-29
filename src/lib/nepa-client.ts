/**
 * NEPA API Client — shared across all Atlas OS dashboard pages
 * All calls go through Next.js /api proxy routes to avoid CORS issues
 */

export const NEPA_BASE = process.env.NEXT_PUBLIC_NEPA_API_URL ?? "https://nepa.aurasense.io";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
export async function nepaFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NEPA ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Fleet / Registry ─────────────────────────────────────────────────────────
export const getAssets       = ()       => nepaFetch("/api/atlas/registry/assets");
export const getAsset        = (id: string) => nepaFetch(`/api/atlas/registry/assets/${id}`);
export const getTopology     = ()       => nepaFetch("/api/atlas/registry/topology");
export const getBeacon       = ()       => nepaFetch("/api/atlas/registry/beacon");

// ─── NEPA Pipeline ────────────────────────────────────────────────────────────
export const getPipelineLive = ()       => nepaFetch("/api/atlas/nepa/pipeline/live");
export const getStdpSnapshot = ()       => nepaFetch("/api/atlas/nepa/stdp/snapshot");
export const getWorldSnapshot= ()       => nepaFetch("/api/atlas/nepa/world-model/snapshot");

// ─── Operator ─────────────────────────────────────────────────────────────────
export const getActivity     = ()       => nepaFetch("/api/atlas/operator/activity");
export const getTelemetry    = ()       => nepaFetch("/api/atlas/operator/telemetry");

// ─── ArduPilot / Drone Control ───────────────────────────────────────────────
export const getCalibration  = ()       => nepaFetch("/api/atlas/ardupilot/calibration");
export const postCalibrate   = (body: unknown) => nepaFetch("/api/atlas/ardupilot/calibrate", { method: "POST", body: JSON.stringify(body) });
export const getModes        = ()       => nepaFetch("/api/atlas/ardupilot/modes");
export const setMode         = (mode: string) => nepaFetch("/api/atlas/ardupilot/mode", { method: "POST", body: JSON.stringify({ mode }) });
export const getLogs         = ()       => nepaFetch("/api/atlas/ardupilot/logs");
export const linkDrone       = (body: unknown) => nepaFetch("/api/atlas/ardupilot/link", { method: "POST", body: JSON.stringify(body) });

// ─── NERM Mode ────────────────────────────────────────────────────────────────
export const getNermStatus   = ()       => nepaFetch("/api/nepa/nerm/status");
export const setNermMode     = (mode: string) => nepaFetch("/api/nepa/nerm/mode", { method: "POST", body: JSON.stringify({ mode }) });
export const getRuntimeHealth= ()       => nepaFetch("/api/nepa/runtime/health");

// ─── Skills ───────────────────────────────────────────────────────────────────
export const bundleCheckout  = (body: unknown) => nepaFetch("/api/skills/bundle-checkout", { method: "POST", body: JSON.stringify(body) });

// ─── Billing ──────────────────────────────────────────────────────────────────
export const getBillingMe    = ()       => nepaFetch("/api/billing/me");

// ─── Compliance ───────────────────────────────────────────────────────────────
export const exportCompliance= (body: unknown) => nepaFetch("/api/compliance/export", { method: "POST", body: JSON.stringify(body) });

// ─── CSM Alerts ───────────────────────────────────────────────────────────────
export const acknowledgeAlert= (id: string) => nepaFetch(`/api/csm/alerts/${id}/acknowledge`, { method: "POST" });

// ─── Threat ───────────────────────────────────────────────────────────────────
export const getThreatTracks = ()       => nepaFetch("/api/atlas/threat/tracks");
export const engageThreat    = (body: unknown) => nepaFetch("/api/atlas/threat/engage", { method: "POST", body: JSON.stringify(body) });

// ─── Rehearse / Simulation ────────────────────────────────────────────────────
export const startRehearsal  = (body: unknown) => nepaFetch("/api/rehearse/session", { method: "POST", body: JSON.stringify(body) });
export const getFreeRunStatus= ()       => nepaFetch("/api/rehearse/free-run-status");

// ─── World Model ─────────────────────────────────────────────────────────────
export const postWorldEnvelope = (body: unknown) => nepaFetch("/api/world-model/envelope", { method: "POST", body: JSON.stringify(body) });
export const forkWorldModel    = (body: unknown) => nepaFetch("/api/world-model/fork", { method: "POST", body: JSON.stringify(body) });

// ─── SLO ─────────────────────────────────────────────────────────────────────
export const getSloStatus    = (siteId: string) => nepaFetch(`/api/slo/status?siteId=${siteId}`);
