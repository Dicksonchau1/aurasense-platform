import type { Quat, Vec3 } from "./types";

export const IDENTITY_QUAT: Quat = [1, 0, 0, 0];

export function quatNorm(q: Quat): number {
  return Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
}

export function quatNormalize(q: Quat): Quat {
  const n = quatNorm(q);
  if (n === 0) return IDENTITY_QUAT;
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

export function quatConjugate(q: Quat): Quat {
  return [q[0], -q[1], -q[2], -q[3]];
}

// Hamilton product q = a * b
export function quatMul(a: Quat, b: Quat): Quat {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

// Rotate a body-frame vector into the inertial frame using q (body->inertial).
export function bodyToInertial(q: Quat, v: Vec3): Vec3 {
  const vq: Quat = [0, v[0], v[1], v[2]];
  const r = quatMul(quatMul(q, vq), quatConjugate(q));
  return [r[1], r[2], r[3]];
}

export function inertialToBody(q: Quat, v: Vec3): Vec3 {
  return bodyToInertial(quatConjugate(q), v);
}

// Integrate quaternion under body-frame angular velocity omega for time dt.
// Uses first-order exponential map; small-angle accurate at typical control rates.
export function quatIntegrate(q: Quat, omega: Vec3, dt: number): Quat {
  const ox = omega[0], oy = omega[1], oz = omega[2];
  const half = dt * 0.5;
  const dq: Quat = [1, ox * half, oy * half, oz * half];
  return quatNormalize(quatMul(q, dq));
}

export function vecAdd(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function vecSub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vecScale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function vecDot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vecMag(a: Vec3): number {
  return Math.sqrt(vecDot(a, a));
}

export const ZERO_VEC: Vec3 = [0, 0, 0];
