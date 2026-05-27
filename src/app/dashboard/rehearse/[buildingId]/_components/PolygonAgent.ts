// Polygon Agent — facade inspection orchestrator.
// Inputs: building meta, detected anomalies per floor/face, operator preferences.
// Output: ordered sweep plan + live feedback stream.
//
// Decisions:
//   - Critical defects -> contour sweep (slow, close passes)
//   - Advisory defects -> lawnmower (efficient coverage)
//   - Multi-face plans -> chain by risk priority desc
//   - Battery budget check -> warn if projected SoC < 25% on completion

import { generateSweep, estimateDurationMin, type SweepKind, type Face, type SweepRequest } from "./SweepEngine";
import type { Waypoint } from "./WaypointEditor";

export type Severity = "critical" | "advisory" | "low" | "nominal";

export interface FloorDefect {
  floor: number;
  face: Face;
  severity: Severity;
  defectCode: string;     // e.g. "DEF-202 Spalling"
  confidence: number;     // 0..1
}

export interface BuildingContext {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heightM: number;
  totalFloors: number;
}

export interface AirframeSpec {
  id: string;
  massKg: number;
  motorCount: number;
  maxThrustPerMotorN: number;
  hoverCurrentA: number;
  batteryCapacityAh: number;
  batteryCellsSeries: number;
}

export interface WeatherSnapshot {
  windSpeedMs: number;
  windDirDeg: number;
  temperatureC: number;
}

export interface InspectionPlan {
  id: string;
  buildingId: string;
  steps: PlanStep[];
  totalWaypoints: number;
  totalDurationMin: number;
  projectedBatterySocPct: number;
  warnings: string[];
}

export interface PlanStep {
  index: number;
  face: Face;
  floorLow: number;
  floorHigh: number;
  sweepKind: SweepKind;
  reason: string;
  waypoints: Waypoint[];
  durationMin: number;
  defectsTargeted: FloorDefect[];
}

export interface AgentFeedback {
  ts: number;
  kind: "info" | "warn" | "error" | "tick";
  msg: string;
  meta?: Record<string, unknown>;
}

export type FeedbackHandler = (msg: AgentFeedback) => void;

// ---------------------------------------------------------------------------
// Decision functions
// ---------------------------------------------------------------------------
function pickSweepKind(defects: FloorDefect[]): { kind: SweepKind; reason: string } {
  const hasCritical = defects.some((d) => d.severity === "critical");
  const hasAdvisory = defects.some((d) => d.severity === "advisory");
  if (hasCritical) {
    return { kind: "contour", reason: "Critical defects require close perimeter passes" };
  }
  if (hasAdvisory && defects.length > 3) {
    return { kind: "lawnmower", reason: "Multiple advisory defects - dense lawnmower coverage" };
  }
  return { kind: "spiral", reason: "Standard inspection sweep" };
}

function groupDefectsByFace(defects: FloorDefect[]): Record<Face, FloorDefect[]> {
  const out: Record<Face, FloorDefect[]> = { N: [], E: [], S: [], W: [] };
  for (const d of defects) out[d.face].push(d);
  return out;
}

function severityRank(d: FloorDefect): number {
  if (d.severity === "critical") return 3;
  if (d.severity === "advisory") return 2;
  if (d.severity === "low") return 1;
  return 0;
}

function faceRiskScore(defects: FloorDefect[]): number {
  return defects.reduce((sum, d) => sum + severityRank(d) * d.confidence, 0);
}

// ---------------------------------------------------------------------------
// Battery projection
// ---------------------------------------------------------------------------
function projectBatteryDrain(
  durationMin: number,
  airframe: AirframeSpec,
  wind: WeatherSnapshot,
  initialSocPct: number,
): number {
  // Hover current + wind penalty + cruise overhead
  const windPenalty = 1 + Math.min(0.4, wind.windSpeedMs / 30);
  const cruiseCurrentA = airframe.hoverCurrentA * 1.15 * windPenalty;
  const cellVoltage = 3.7;
  const drawnAh = (cruiseCurrentA * durationMin) / 60;
  const drawnPct = (drawnAh / airframe.batteryCapacityAh) * 100;
  return Math.max(0, initialSocPct - drawnPct);
}

// ---------------------------------------------------------------------------
// Main planner
// ---------------------------------------------------------------------------
export function planInspection(
  building: BuildingContext,
  defects: FloorDefect[],
  airframe: AirframeSpec,
  weather: WeatherSnapshot,
  initialBatteryPct: number,
  onFeedback?: FeedbackHandler,
): InspectionPlan {
  const startTs = Date.now();
  const fb = (kind: AgentFeedback["kind"], msg: string, meta?: Record<string, unknown>) => {
    if (onFeedback) onFeedback({ ts: Date.now(), kind, msg, meta });
  };

  fb("info", "Polygon Agent activated for " + building.name);
  fb("info", "Conditions: wind " + weather.windSpeedMs.toFixed(1) + " m/s @ " + Math.round(weather.windDirDeg) + " deg, " + weather.temperatureC + "C");
  fb("info", "Airframe: " + airframe.id + " (" + airframe.massKg.toFixed(2) + " kg, " + airframe.motorCount + " motors)");
  fb("info", defects.length + " defects detected across the structure");

  const byFace = groupDefectsByFace(defects);
  const facesByPriority: Array<{ face: Face; defects: FloorDefect[]; score: number }> = (Object.keys(byFace) as Face[])
    .map((f) => ({ face: f, defects: byFace[f], score: faceRiskScore(byFace[f]) }))
    .filter((x) => x.defects.length > 0)
    .sort((a, b) => b.score - a.score);

  if (facesByPriority.length === 0) {
    fb("warn", "No defects to inspect - returning empty plan");
    return { id: "plan-" + startTs.toString(36), buildingId: building.id, steps: [], totalWaypoints: 0, totalDurationMin: 0, projectedBatterySocPct: initialBatteryPct, warnings: ["No defects targeted"] };
  }

  const steps: PlanStep[] = [];
  let totalDuration = 0;
  let totalWaypoints = 0;

  facesByPriority.forEach((fp, i) => {
    const floors = fp.defects.map((d) => d.floor).sort((a, b) => a - b);
    const floorLow = Math.max(1, floors[0] - 1);
    const floorHigh = Math.min(building.totalFloors, floors[floors.length - 1] + 1);
    const sweep = pickSweepKind(fp.defects);
    const req: SweepRequest = {
      buildingLat: building.lat,
      buildingLng: building.lng,
      face: fp.face,
      floorLow,
      floorHigh,
      totalFloors: building.totalFloors,
      buildingHeightM: building.heightM,
      kind: sweep.kind,
      speedMs: sweep.kind === "contour" ? 3 : 5,
    };
    const wps = generateSweep(req);
    const dur = estimateDurationMin(wps);
    fb("info", "Step " + (i + 1) + ": Face " + fp.face + " floors " + floorLow + "-" + floorHigh + " · " + sweep.kind + " sweep");
    fb("info", "  Reasoning: " + sweep.reason);
    const gsdM = sweep.kind === "contour" ? 0.3 : sweep.kind === "lawnmower" ? 0.8 : 0.5;
    fb("info", "  Target GSD: " + gsdM + "m · Speed: " + (sweep.kind === "contour" ? 3 : 5) + " m/s · Standoff: 44m");
    const critCount = fp.defects.filter((d) => d.severity === "critical").length;
    const advCount = fp.defects.filter((d) => d.severity === "advisory").length;
    if (critCount > 0) fb("warn", "  " + critCount + " critical defect(s) - close-pass inspection priority");
    if (advCount > 0) fb("info", "  " + advCount + " advisory defect(s) - secondary verification");
    fb("info", "  " + wps.length + " waypoints, ETA " + dur.toFixed(1) + " min, targeting " + fp.defects.length + " defects");
    steps.push({
      index: i,
      face: fp.face,
      floorLow,
      floorHigh,
      sweepKind: sweep.kind,
      reason: sweep.reason,
      waypoints: wps,
      durationMin: dur,
      defectsTargeted: fp.defects,
    });
    totalDuration += dur;
    totalWaypoints += wps.length;
  });

  const projectedSoc = projectBatteryDrain(totalDuration, airframe, weather, initialBatteryPct);
  const warnings: string[] = [];
  if (projectedSoc < 25) {
    warnings.push("Projected battery SoC " + projectedSoc.toFixed(0) + "% < 25% RTL threshold");
    fb("warn", "Battery budget critical: " + projectedSoc.toFixed(0) + "% on completion");
  } else {
    fb("info", "Battery budget OK: projected " + projectedSoc.toFixed(0) + "% on completion");
  }
  if (weather.windSpeedMs > 12) {
    warnings.push("Wind " + weather.windSpeedMs.toFixed(1) + " m/s exceeds 12 m/s safe inspection limit");
    fb("warn", "Wind exceeds platform limit");
  }
  fb("info", "Plan ready: " + steps.length + " steps, " + totalWaypoints + " waypoints, " + totalDuration.toFixed(1) + " min total");

  return {
    id: "plan-" + startTs.toString(36),
    buildingId: building.id,
    steps,
    totalWaypoints,
    totalDurationMin: totalDuration,
    projectedBatterySocPct: projectedSoc,
    warnings,
  };
}

// Flatten plan steps into a single waypoint stream (for handing to live sim)
export function flattenPlan(plan: InspectionPlan): Waypoint[] {
  const out: Waypoint[] = [];
  let seq = 1;
  for (const step of plan.steps) {
    for (const w of step.waypoints) {
      out.push({ ...w, seq: seq++ });
    }
  }
  return out;
}