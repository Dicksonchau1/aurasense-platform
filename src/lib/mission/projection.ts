// Camera-space projection used by the pseudo-3D viewport.

export interface CameraState {
  angleH: number;
  angleV: number;
  dist: number;
  target: { x: number; y: number; z: number };
}

export interface Projected {
  px: number;
  py: number;
  depth: number;
}

export function project(
  x: number,
  y: number,
  z: number,
  cam: CameraState,
  cx: number,
  cy: number,
  fov = 520,
): Projected | null {
  const dx = x - cam.target.x;
  const dy = y - cam.target.y;
  const dz = z - cam.target.z;

  const cosH = Math.cos(cam.angleH);
  const sinH = Math.sin(cam.angleH);
  const rx = dx * cosH - dz * sinH;
  const rz = dx * sinH + dz * cosH;
  const ry = dy;

  const cosV = Math.cos(cam.angleV);
  const sinV = Math.sin(cam.angleV);
  const ry2 = ry * cosV - rz * sinV;
  const rz2 = ry * sinV + rz * cosV;

  const camZ = rz2 + cam.dist;
  if (camZ < 1) return null;

  return {
    px: cx + (rx / camZ) * fov,
    py: cy - (ry2 / camZ) * fov,
    depth: camZ,
  };
}

export function projectFace(
  corners: Array<[number, number, number]>,
  cam: CameraState,
  cx: number,
  cy: number,
): Projected[] {
  const out: Projected[] = [];
  for (const [x, y, z] of corners) {
    const p = project(x, y, z, cam, cx, cy);
    if (p) out.push(p);
  }
  return out;
}

export const DEFAULT_CAMERA: CameraState = {
  angleH: 0.6,
  angleV: 0.45,
  dist: 130,
  target: { x: 0, y: 12, z: 0 },
};

export const VIEW_PRESETS: Record<string, CameraState> = {
  orbit:  { angleH: 0.6,  angleV: 0.45, dist: 130, target: { x: 0, y: 12, z: 0 } },
  street: { angleH: 0.6,  angleV: 0.12, dist:  80, target: { x: 0, y:  3, z: 0 } },
  facade: { angleH: 3.14, angleV: 0.35, dist:  60, target: { x: 0, y: 18, z: 0 } },
};

export type Mode = "wp" | "home" | "excl";
export type DroneModel = "m30t" | "m350" | "evo";

export const DRONE_SCALE: Record<DroneModel, number> = {
  m30t: 1.3,
  m350: 1.7,
  evo:  0.9,
};

// Inverse projection helper - finds the world (x, z) at a fixed altitude y
// whose forward projection lands closest to (mx, my) in screen space.
export function unprojectAtAltitude(
  mx: number,
  my: number,
  y: number,
  cam: CameraState,
  cx: number,
  cy: number,
): { x: number; z: number } | null {
  let bestDist = 1e9;
  let bestX = 0;
  let bestZ = 0;
  for (let tx = -60; tx <= 60; tx += 2) {
    for (let tz = -60; tz <= 60; tz += 2) {
      const p = project(tx, y, tz, cam, cx, cy);
      if (!p) continue;
      const d = (p.px - mx) ** 2 + (p.py - my) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestX = tx;
        bestZ = tz;
      }
    }
  }
  if (bestDist > 5000) return null;
  return { x: bestX, z: bestZ };
}
