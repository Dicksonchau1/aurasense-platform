// Sim runner: drives the RK4 integrator for N steps with a constant hover-ish control,
// returns summary stats. Used by /api/atlas/sim/run.

import { rk4Step } from "@/lib/physics/integrator";
import { getAirframe, hoverThrottle } from "@/lib/physics/airframes";
import { ISA_SEA_LEVEL } from "@/lib/physics/types";
import type { Control, DroneState, Environment, Vec3 } from "@/lib/physics/types";

export interface SimRunRequest {
  airframeId: string;
  durationS: number;
  dt?: number;
  initial?: Partial<DroneState>;
  environment?: Partial<Environment>;
  controlBias?: number;
}

export interface SimRunResult {
  airframeId: string;
  durationS: number;
  dt: number;
  steps: number;
  finalState: DroneState;
  energyTotalJ: number;
  maxAltitudeM: number;
  maxSpeedMs: number;
  startedAt: string;
  completedAt: string;
  warnings: string[];
}

const DEFAULT_DT = 0.02;
const REST: DroneState = {
  t: 0,
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  attitude: [1, 0, 0, 0],
  angularVelocity: [0, 0, 0],
  batterySoc: 1.0,
  batteryVoltage: 25.2,
};

function mergeState(base: DroneState, partial?: Partial<DroneState>): DroneState {
  if (!partial) return base;
  return {
    t: partial.t ?? base.t,
    position: (partial.position ?? base.position) as Vec3,
    velocity: (partial.velocity ?? base.velocity) as Vec3,
    attitude: (partial.attitude ?? base.attitude) as DroneState["attitude"],
    angularVelocity: (partial.angularVelocity ?? base.angularVelocity) as Vec3,
    batterySoc: partial.batterySoc ?? base.batterySoc,
    batteryVoltage: partial.batteryVoltage ?? base.batteryVoltage,
  };
}

function mergeEnv(base: Environment, partial?: Partial<Environment>): Environment {
  if (!partial) return base;
  return {
    gravity: partial.gravity ?? base.gravity,
    airDensity: partial.airDensity ?? base.airDensity,
    wind: (partial.wind ?? base.wind) as Vec3,
    temperatureC: partial.temperatureC ?? base.temperatureC,
  };
}

export function runSim(req: SimRunRequest): SimRunResult {
  const startedAt = new Date().toISOString();
  const spec = getAirframe(req.airframeId);
  const dt = req.dt ?? DEFAULT_DT;
  const totalSteps = Math.max(1, Math.floor(req.durationS / dt));
  const env = mergeEnv(ISA_SEA_LEVEL, req.environment);
  let state = mergeState(REST, req.initial);
  const hover = hoverThrottle(spec);
  const bias = req.controlBias ?? 1.05;
  const control: Control = { throttle: Array(spec.motorCount).fill(Math.min(0.95, hover * bias)) };

  let energyJ = 0;
  let maxAlt = 0;
  let maxSpd = 0;
  const warnings: string[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const step = rk4Step(spec, state, control, env, dt);
    state = step.after;
    energyJ += step.energyJ;

    const altDown = state.position[2];
    const altUp = -altDown;
    if (altUp > maxAlt) maxAlt = altUp;

    const speed = Math.hypot(state.velocity[0], state.velocity[1], state.velocity[2]);
    if (speed > maxSpd) maxSpd = speed;

    if (state.batterySoc <= 0.05 && !warnings.includes("battery_depleted")) {
      warnings.push("battery_depleted");
      break;
    }
    if (altUp < -2 && !warnings.includes("crashed_below_ground")) {
      warnings.push("crashed_below_ground");
      break;
    }
  }

  if (state.batterySoc < 0.20 && !warnings.includes("battery_depleted")) {
    warnings.push("low_battery");
  }
  if (maxSpd > 25 && !warnings.includes("speed_exceeded")) {
    warnings.push("speed_exceeded");
  }

  return {
    airframeId: req.airframeId,
    durationS: req.durationS,
    dt,
    steps: totalSteps,
    finalState: state,
    energyTotalJ: energyJ,
    maxAltitudeM: maxAlt,
    maxSpeedMs: maxSpd,
    startedAt,
    completedAt: new Date().toISOString(),
    warnings,
  };
}