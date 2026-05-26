import type { AirframeSpec, DroneState, Environment, Vec3 } from "./types";
import { hoverThrottle, thrustToWeightRatio } from "./airframes";
import { vecMag } from "./body-frame";

export interface PhysicsDisplay {
  hoverThrottlePct: number;
  currentThrottlePct: number;
  thrustHeadroomPct: number;
  twr: number;
  batterySocPct: number;
  enduranceMin: number;
  windRelMs: number;
  windCorrectionM: number;
  motorTempsC: number[];
  motorWear: number[];
  warnings: string[];
}

export function airDensity(temperatureC: number, pressureHpa = 1013.25): number {
  const t = temperatureC + 273.15;
  return (pressureHpa * 100) / (287.058 * t);
}

export function endpointWindRel(state: DroneState, env: Environment): number {
  const rel: Vec3 = [
    state.velocity[0] - env.wind[0],
    state.velocity[1] - env.wind[1],
    state.velocity[2] - env.wind[2],
  ];
  return vecMag(rel);
}

export function enduranceMinutes(spec: AirframeSpec, batterySoc: number, currentA: number): number {
  if (currentA <= 0) return Infinity;
  const wh = spec.batteryCapacityAh * batterySoc * spec.batteryCellsSeries * 3.7;
  const wDraw = currentA * spec.batteryCellsSeries * 3.7;
  return (wh / wDraw) * 60;
}

export function windCorrectionMeters(env: Environment, missionDistanceM = 100): number {
  const w = vecMag(env.wind);
  return (w * w * missionDistanceM) / 800;
}

export function deriveDisplay(
  spec: AirframeSpec,
  state: DroneState,
  env: Environment,
  throttle: number[],
  motorTempsC: number[] = [],
  motorWear: number[] = [],
): PhysicsDisplay {
  const hover = hoverThrottle(spec);
  const avg = throttle.length ? throttle.reduce((a, b) => a + b, 0) / throttle.length : 0;
  const twr = thrustToWeightRatio(spec);
  const tempsC = motorTempsC.length === spec.motorCount ? motorTempsC : Array(spec.motorCount).fill(env.temperatureC + 25);
  const wear = motorWear.length === spec.motorCount ? motorWear : Array(spec.motorCount).fill(0.95);
  const currentDraw = spec.hoverCurrentA * (avg / Math.max(0.001, hover));
  const endMin = enduranceMinutes(spec, state.batterySoc, currentDraw);
  const wRel = endpointWindRel(state, env);
  const wCorrM = windCorrectionMeters(env);

  const warnings: string[] = [];
  const windSpeed = vecMag(env.wind);
  if (windSpeed > 12) warnings.push("Wind " + windSpeed.toFixed(1) + " m/s exceeds 12 m/s limit");
  if (state.batterySoc < 0.2) warnings.push("Battery " + (state.batterySoc * 100).toFixed(0) + "% - RTL imminent");
  if (avg > 0.85) warnings.push("Throttle " + (avg * 100).toFixed(0) + "% - limited headroom");
  const maxTemp = Math.max(...tempsC);
  if (maxTemp > 85) warnings.push("Motor temp " + maxTemp.toFixed(0) + "C - thermal derate");
  const minWear = Math.min(...wear);
  if (minWear < 0.85) warnings.push("Motor wear " + (minWear * 100).toFixed(0) + "% - inspect");

  return {
    hoverThrottlePct: hover * 100,
    currentThrottlePct: avg * 100,
    thrustHeadroomPct: Math.max(0, (1 - avg) * 100),
    twr,
    batterySocPct: state.batterySoc * 100,
    enduranceMin: Number.isFinite(endMin) ? endMin : 0,
    windRelMs: wRel,
    windCorrectionM: wCorrM,
    motorTempsC: tempsC,
    motorWear: wear,
    warnings,
  };
}
