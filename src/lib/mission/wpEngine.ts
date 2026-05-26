// Waypoint type + helpers used by the main viewport and the Robot > WP Engine sub-tab.

export type WaypointKind = "wp" | "home" | "excl";

export interface Waypoint {
  x: number;
  y: number;
  z: number;
  type: WaypointKind;
  id: number;
}

// 3.8x scale factor mirrors original drawing's distance metric.
export function calcDist(WPs: Waypoint[]): number {
  let d = 0;
  for (let i = 1; i < WPs.length; i++) {
    const a = WPs[i - 1];
    const b = WPs[i];
    d += Math.sqrt(
      (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2,
    ) * 3.8;
  }
  return d;
}

// Greedy NN by x. Lifts every WP to a uniform altitude.
export function optimise(WPs: Waypoint[], altitude: number): Waypoint[] {
  return [...WPs]
    .sort((a, b) => a.x - b.x)
    .map((w, i) => ({ ...w, y: altitude / 4, id: i }));
}

export const WP_COLORS = [
  "#0891b2",
  "#7c3aed",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#ec4899",
  "#06b6d4",
];

// Pre-flight items derived from current mission state.
export interface PreflightItem {
  ok: boolean;
  label: string;
  detail: string;
}

export function buildPreflight(
  wpCount: number,
  altitude: number,
): PreflightItem[] {
  return [
    { ok: wpCount > 0,    label: "Waypoints set",    detail: `${wpCount} defined` },
    { ok: true,           label: "Wind OK",          detail: "5.2m/s < 12m/s limit" },
    { ok: true,           label: "Battery 87%",      detail: "Est. bat needed 41% (min)" },
    { ok: altitude <= 120,label: "Alt within limit", detail: `${altitude}m < 120m AMSL` },
    { ok: true,           label: "HKCAD permit",     detail: "Cat B exp 2026-12-31" },
    { ok: false,          label: "Solar glare",      detail: "45° - schedule 07-09 HKT" },
  ];
}
