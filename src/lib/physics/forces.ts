import type {
  AirframeSpec,
  Control,
  DroneState,
  Environment,
  Forces,
  Vec3,
} from "./types";
import { bodyToInertial, vecMag, vecScale, vecSub } from "./body-frame";

// Thrust per motor as a function of normalized throttle [0..1] and a density factor.
// Simple linear-in-throttle, density-scaled model. Tunable later.
export function motorThrustN(
  spec: AirframeSpec,
  throttle: number,
  airDensity: number,
): number {
  const t = Math.min(1, Math.max(0, throttle));
  const rho0 = 1.225;
  const densityFactor = airDensity / rho0;
  return spec.maxThrustPerMotorN * t * densityFactor;
}

// Body-frame layout assumed: thrust acts along -Z_body (up in NED body frame,
// because body-Z points down). We return the total thrust vector in body coords.
export function thrustBodyVector(
  spec: AirframeSpec,
  control: Control,
  airDensity: number,
): Vec3 {
  if (control.throttle.length !== spec.motorCount) {
    throw new Error(
      `Control has ${control.throttle.length} channels, airframe expects ${spec.motorCount}`,
    );
  }
  let total = 0;
  for (let i = 0; i < spec.motorCount; i++) {
    total += motorThrustN(spec, control.throttle[i], airDensity);
  }
  // Thrust is opposite to body-Z (which points down in FRD), so produce -Z component.
  return [0, 0, -total];
}

// Body-frame moments from motor differentials. Quad assumes X-config:
//   m0 front-right, m1 back-right, m2 back-left, m3 front-left, alternating spin.
// Hex/Oct generalized: equally spaced. CCW/CW alternates from index 0.
export function momentBody(
  spec: AirframeSpec,
  control: Control,
  airDensity: number,
): Vec3 {
  const n = spec.motorCount;
  const r = spec.armLengthM;
  let mx = 0;
  let my = 0;
  let mz = 0;
  const yawCoeff = 0.015 * spec.propDiameterM; // crude yaw moment per N thrust
  for (let i = 0; i < n; i++) {
    const t = motorThrustN(spec, control.throttle[i], airDensity);
    const angle = (Math.PI * 2 * i) / n + Math.PI / n;
    const dx = r * Math.cos(angle);
    const dy = r * Math.sin(angle);
    // Roll (about body-X) and pitch (about body-Y) from moment arms.
    mx += -dy * t;
    my += dx * t;
    // Yaw: alternating direction by motor index.
    const dir = i % 2 === 0 ? 1 : -1;
    mz += dir * yawCoeff * t;
  }
  return [mx, my, mz];
}

// Quadratic drag in inertial frame, opposes relative wind.
export function dragInertial(
  spec: AirframeSpec,
  state: DroneState,
  env: Environment,
): Vec3 {
  const relVel = vecSub(state.velocity, env.wind);
  const speed = vecMag(relVel);
  if (speed === 0) return [0, 0, 0];
  const mag = 0.5 * env.airDensity * spec.dragCoefficient * spec.frontalAreaM2 * speed * speed;
  return vecScale(relVel, -mag / speed);
}

export function gravityInertial(spec: AirframeSpec, env: Environment): Vec3 {
  // NED: gravity acts +Z (down).
  return [0, 0, spec.massKg * env.gravity];
}

export function computeForces(
  spec: AirframeSpec,
  state: DroneState,
  control: Control,
  env: Environment,
): Forces {
  const thrustBody = thrustBodyVector(spec, control, env.airDensity);
  const moment = momentBody(spec, control, env.airDensity);
  return {
    thrustBody,
    dragInertial: dragInertial(spec, state, env),
    gravityInertial: gravityInertial(spec, env),
    momentBody: moment,
  };
}

// Convenience: net inertial force on the body (sum of thrust rotated to inertial,
// gravity, drag). Used by the integrator.
export function netInertialForce(
  spec: AirframeSpec,
  state: DroneState,
  forces: Forces,
): Vec3 {
  const thrustInertial = bodyToInertial(state.attitude, forces.thrustBody);
  return [
    thrustInertial[0] + forces.gravityInertial[0] + forces.dragInertial[0],
    thrustInertial[1] + forces.gravityInertial[1] + forces.dragInertial[1],
    thrustInertial[2] + forces.gravityInertial[2] + forces.dragInertial[2],
  ];
}
