// Sweep waypoint generator for facade inspection.
// Given a building face (centroid lat/lng, height range, width), produces
// a sequence of waypoints in lawnmower / spiral / contour pattern.

import type { Waypoint } from "./WaypointEditor";

export type SweepKind = "lawnmower" | "spiral" | "contour";
export type Face = "N" | "E" | "S" | "W";

export interface SweepRequest {
  buildingLat: number;
  buildingLng: number;
  face: Face;
  floorLow: number;
  floorHigh: number;
  totalFloors: number;
  buildingHeightM: number;
  kind: SweepKind;
  gsdM?: number;        // ground sample distance ~ stride between passes
  standoffM?: number;   // distance off facade
  speedMs?: number;
}

const FACE_OFFSET = 0.00055;   // ~44m at HK latitude
const SWEEP_HALF_WIDTH = 0.00050;  // ~28m sideways from centroid

function faceOffset(face: Face): { dLat: number; dLng: number } {
  if (face === "N") return { dLat: FACE_OFFSET, dLng: 0 };
  if (face === "S") return { dLat: -FACE_OFFSET, dLng: 0 };
  if (face === "E") return { dLat: 0, dLng: FACE_OFFSET };
  return { dLat: 0, dLng: -FACE_OFFSET };
}

function sideAxis(face: Face): { dLat: number; dLng: number } {
  // Perpendicular to the face normal; lateral sweep direction
  if (face === "N" || face === "S") return { dLat: 0, dLng: SWEEP_HALF_WIDTH };
  return { dLat: SWEEP_HALF_WIDTH, dLng: 0 };
}

export function generateSweep(req: SweepRequest): Waypoint[] {
  const floorH = req.buildingHeightM / Math.max(1, req.totalFloors);
  const altLow = (req.floorLow - 1) * floorH + 2;
  const altHigh = req.floorHigh * floorH - 2;
  const stride = req.gsdM ?? Math.max(2, floorH * 0.6);
  const rowCount = Math.max(1, Math.floor((altHigh - altLow) / stride) + 1);
  const fo = faceOffset(req.face);
  const sa = sideAxis(req.face);
  const speed = req.speedMs ?? 4.5;

  const baseLat = req.buildingLat + fo.dLat;
  const baseLng = req.buildingLng + fo.dLng;

  const out: Waypoint[] = [];
  let seq = 1;

  if (req.kind === "lawnmower") {
    for (let r = 0; r < rowCount; r++) {
      const alt = altLow + r * stride;
      const leftToRight = r % 2 === 0;
      const start = leftToRight ? -1 : 1;
      const end = leftToRight ? 1 : -1;
      out.push({ seq: seq++, lat: baseLat + sa.dLat * start, lng: baseLng + sa.dLng * start, alt_m: alt, speed_ms: speed });
      out.push({ seq: seq++, lat: baseLat + sa.dLat * end,   lng: baseLng + sa.dLng * end,   alt_m: alt, speed_ms: speed });
    }
  } else if (req.kind === "spiral") {
    const turns = Math.max(2, rowCount);
    for (let i = 0; i <= turns * 12; i++) {
      const t = i / 12;
      const angle = t * Math.PI * 2;
      const radius = 1 - Math.min(1, t / turns);
      const alt = altLow + (i / (turns * 12)) * (altHigh - altLow);
      out.push({
        seq: seq++,
        lat: baseLat + sa.dLat * radius * Math.cos(angle),
        lng: baseLng + sa.dLng * radius * Math.sin(angle),
        alt_m: alt,
        speed_ms: speed,
      });
    }
  } else {
    // contour: 4-corner rectangle perimeter at each floor (no more 2-point collapse)
    for (let r = 0; r < rowCount; r++) {
      const alt = altLow + r * stride;
      // For a face with sideAxis sa, the perpendicular is the face-normal we already offset with.
      // Build 4 corners around the face centroid with both lateral spread (sa) AND
      // a small fore/aft offset along the face normal to give the rectangle depth.
      const cornerForward = 0.00006; // ~6.6m fore/aft along face normal
      let forwardLat = 0;
      let forwardLng = 0;
      if (req.face === "N") forwardLat = cornerForward;
      else if (req.face === "S") forwardLat = -cornerForward;
      else if (req.face === "E") forwardLng = cornerForward;
      else forwardLng = -cornerForward;
      out.push({ seq: seq++, lat: baseLat + sa.dLat + forwardLat, lng: baseLng + sa.dLng + forwardLng, alt_m: alt, speed_ms: speed });
      out.push({ seq: seq++, lat: baseLat + sa.dLat - forwardLat, lng: baseLng + sa.dLng - forwardLng, alt_m: alt, speed_ms: speed });
      out.push({ seq: seq++, lat: baseLat - sa.dLat - forwardLat, lng: baseLng - sa.dLng - forwardLng, alt_m: alt, speed_ms: speed });
      out.push({ seq: seq++, lat: baseLat - sa.dLat + forwardLat, lng: baseLng - sa.dLng + forwardLng, alt_m: alt, speed_ms: speed });
    }
  }
  return out;
}

export function estimateDurationMin(wps: Waypoint[]): number {
  if (wps.length < 2) return 0;
  const R = 6378137;
  let dist = 0;
  for (let i = 1; i < wps.length; i++) {
    const a = wps[i - 1];
    const b = wps[i];
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const meanLat = (((a.lat + b.lat) / 2) * Math.PI) / 180;
    const horizM = Math.sqrt(Math.pow(dLat * R, 2) + Math.pow(dLng * R * Math.cos(meanLat), 2));
    const vertM = Math.abs(b.alt_m - a.alt_m);
    const segM = Math.sqrt(horizM * horizM + vertM * vertM);
    const speed = Math.max(0.5, (a.speed_ms + b.speed_ms) / 2);
    dist += segM / speed;
  }
  return dist / 60;
}