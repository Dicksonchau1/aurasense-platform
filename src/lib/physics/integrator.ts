import type {
  AirframeSpec,
  Control,
  DroneState,
  Environment,
  Forces,
  IntegratorStep,
  Vec3,
} from "./types";
import { computeForces, netInertialForce } from "./forces";
import { quatIntegrate, vecAdd, vecScale } from "./body-frame";

interface Derivative {
  readonly dPos: Vec3;
  readonly dVel: Vec3;
  readonly dOmega: Vec3;
}

function derivative(
  spec: AirframeSpec,
  state: DroneState,
  control: Control,
  env: Environment,
): { d: Derivative; forces: Forces } {
  const forces = computeForces(spec, state, control, env);
  const F = netInertialForce(spec, state, forces);
  const dVel: Vec3 = [F[0] / spec.massKg, F[1] / spec.massKg, F[2] / spec.massKg];
  const M = forces.momentBody;
  const I = spec.inertia;
  const w = state.angularVelocity;
  const Iw: Vec3 = [I[0] * w[0], I[1] * w[1], I[2] * w[2]];
  const wCrossIw: Vec3 = [
    w[1] * Iw[2] - w[2] * Iw[1],
    w[2] * Iw[0] - w[0] * Iw[2],
    w[0] * Iw[1] - w[1] * Iw[0],
  ];
  const dOmega: Vec3 = [
    (M[0] - wCrossIw[0]) / I[0],
    (M[1] - wCrossIw[1]) / I[1],
    (M[2] - wCrossIw[2]) / I[2],
  ];
  return {
    d: { dPos: state.velocity, dVel, dOmega },
    forces,
  };
}

function applyDerivative(
  state: DroneState,
  d: Derivative,
  dt: number,
): DroneState {
  return {
    t: state.t + dt,
    position: vecAdd(state.position, vecScale(d.dPos, dt)),
    velocity: vecAdd(state.velocity, vecScale(d.dVel, dt)),
    attitude: quatIntegrate(state.attitude, state.angularVelocity, dt),
    angularVelocity: vecAdd(state.angularVelocity, vecScale(d.dOmega, dt)),
    batterySoc: state.batterySoc,
    batteryVoltage: state.batteryVoltage,
  };
}

function instantaneousCurrentA(
  spec: AirframeSpec,
  control: Control,
): number {
  let throttleSum = 0;
  for (const t of control.throttle) throttleSum += Math.min(1, Math.max(0, t));
  const avg = throttleSum / spec.motorCount;
  return spec.hoverCurrentA * (avg / Math.max(0.001, hoverThrottleApprox(spec)));
}

function hoverThrottleApprox(spec: AirframeSpec): number {
  const max = spec.maxThrustPerMotorN * spec.motorCount;
  if (max <= 0) return 0.5;
  return Math.min(1, (spec.massKg * 9.80665) / max);
}

export function rk4Step(
  spec: AirframeSpec,
  state: DroneState,
  control: Control,
  env: Environment,
  dt: number,
): IntegratorStep {
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error(`rk4Step requires dt > 0, got ${dt}`);
  }
  const k1 = derivative(spec, state, control, env);
  const s2 = applyDerivative(state, k1.d, dt / 2);
  const k2 = derivative(spec, s2, control, env);
  const s3 = applyDerivative(state, k2.d, dt / 2);
  const k3 = derivative(spec, s3, control, env);
  const s4 = applyDerivative(state, k3.d, dt);
  const k4 = derivative(spec, s4, control, env);
  const dPos: Vec3 = [
    (k1.d.dPos[0] + 2 * k2.d.dPos[0] + 2 * k3.d.dPos[0] + k4.d.dPos[0]) / 6,
    (k1.d.dPos[1] + 2 * k2.d.dPos[1] + 2 * k3.d.dPos[1] + k4.d.dPos[1]) / 6,
    (k1.d.dPos[2] + 2 * k2.d.dPos[2] + 2 * k3.d.dPos[2] + k4.d.dPos[2]) / 6,
  ];
  const dVel: Vec3 = [
    (k1.d.dVel[0] + 2 * k2.d.dVel[0] + 2 * k3.d.dVel[0] + k4.d.dVel[0]) / 6,
    (k1.d.dVel[1] + 2 * k2.d.dVel[1] + 2 * k3.d.dVel[1] + k4.d.dVel[1]) / 6,
    (k1.d.dVel[2] + 2 * k2.d.dVel[2] + 2 * k3.d.dVel[2] + k4.d.dVel[2]) / 6,
  ];
  const dOmega: Vec3 = [
    (k1.d.dOmega[0] + 2 * k2.d.dOmega[0] + 2 * k3.d.dOmega[0] + k4.d.dOmega[0]) / 6,
    (k1.d.dOmega[1] + 2 * k2.d.dOmega[1] + 2 * k3.d.dOmega[1] + k4.d.dOmega[1]) / 6,
    (k1.d.dOmega[2] + 2 * k2.d.dOmega[2] + 2 * k3.d.dOmega[2] + k4.d.dOmega[2]) / 6,
  ];
  const blended: Derivative = { dPos, dVel, dOmega };
  const after = applyDerivative(state, blended, dt);
  const current = instantaneousCurrentA(spec, control);
  const energyJ = state.batteryVoltage * current * dt;
  const newSoc = Math.max(
    0,
    state.batterySoc - (current * dt / 3600) / spec.batteryCapacityAh,
  );
  const afterWithBattery: DroneState = {
    ...after,
    batterySoc: newSoc,
    batteryVoltage: state.batteryVoltage,
  };
  if (
    !Number.isFinite(afterWithBattery.position[0]) ||
    !Number.isFinite(afterWithBattery.velocity[0]) ||
    !Number.isFinite(afterWithBattery.angularVelocity[0])
  ) {
    throw new Error("Integrator produced non-finite state");
  }
  return {
    dt,
    before: state,
    after: afterWithBattery,
    forces: k1.forces,
    energyJ,
  };
}
