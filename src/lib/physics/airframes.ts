import type { AirframeSpec } from "./types";

export const AIRFRAMES: Record<string, AirframeSpec> = {
  "dji-mavic-3-enterprise": {
    id: "dji-mavic-3-enterprise",
    model: "DJI Mavic 3 Enterprise",
    configuration: "quad",
    motorCount: 4,
    massKg: 0.915,
    armLengthM: 0.124,
    propDiameterM: 0.241,
    propPitchM: 0.114,
    maxThrustPerMotorN: 6.8,
    motorKv: 920,
    frontalAreaM2: 0.018,
    dragCoefficient: 1.1,
    inertia: [0.0082, 0.0082, 0.0148],
    batteryCellsSeries: 4,
    batteryCapacityAh: 5.0,
    hoverCurrentA: 6.2,
    specSource: "manufacturer",
  },
  "dji-matrice-30t": {
    id: "dji-matrice-30t",
    model: "DJI Matrice 30T",
    configuration: "quad",
    motorCount: 4,
    massKg: 3.998,
    armLengthM: 0.220,
    propDiameterM: 0.381,
    propPitchM: 0.140,
    maxThrustPerMotorN: 28.4,
    motorKv: 350,
    frontalAreaM2: 0.092,
    dragCoefficient: 1.2,
    inertia: [0.0820, 0.0845, 0.1480],
    batteryCellsSeries: 12,
    batteryCapacityAh: 5.880,
    hoverCurrentA: 24.0,
    specSource: "manufacturer",
  },
  "dji-matrice-350-rtk": {
    id: "dji-matrice-350-rtk",
    model: "DJI Matrice 350 RTK",
    configuration: "quad",
    motorCount: 4,
    massKg: 6.470,
    armLengthM: 0.342,
    propDiameterM: 0.533,
    propPitchM: 0.178,
    maxThrustPerMotorN: 48.1,
    motorKv: 100,
    frontalAreaM2: 0.180,
    dragCoefficient: 1.2,
    inertia: [0.32, 0.32, 0.58],
    batteryCellsSeries: 12,
    batteryCapacityAh: 17.4,
    hoverCurrentA: 28.0,
    specSource: "manufacturer",
  },
  "generic-hex-3kg": {
    id: "generic-hex-3kg",
    model: "Generic Hex 3kg",
    configuration: "hex",
    motorCount: 6,
    massKg: 3.0,
    armLengthM: 0.30,
    propDiameterM: 0.381,
    propPitchM: 0.140,
    maxThrustPerMotorN: 18.0,
    motorKv: 420,
    frontalAreaM2: 0.10,
    dragCoefficient: 1.2,
    inertia: [0.08, 0.08, 0.15],
    batteryCellsSeries: 6,
    batteryCapacityAh: 16.0,
    hoverCurrentA: 22.0,
    specSource: "estimated",
  },
};

export function getAirframe(id: string): AirframeSpec {
  const spec = AIRFRAMES[id];
  if (!spec) throw new Error(`Unknown airframe: ${id}`);
  return spec;
}

export function listAirframeIds(): string[] {
  return Object.keys(AIRFRAMES);
}

export function hoverThrustN(spec: AirframeSpec, gravity = 9.80665): number {
  return spec.massKg * gravity;
}

export function hoverThrottle(spec: AirframeSpec, gravity = 9.80665): number {
  const needed = hoverThrustN(spec, gravity);
  const max = spec.maxThrustPerMotorN * spec.motorCount;
  if (max <= 0) throw new Error(`Airframe ${spec.id} has nonpositive max thrust`);
  return Math.min(1, Math.max(0, needed / max));
}

export function thrustToWeightRatio(spec: AirframeSpec, gravity = 9.80665): number {
  return (spec.maxThrustPerMotorN * spec.motorCount) / (spec.massKg * gravity);
}
