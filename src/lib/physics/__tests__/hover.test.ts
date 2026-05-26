import { describe, it, expect } from "vitest";
import { AIRFRAMES, getAirframe, hoverThrustN, hoverThrottle, thrustToWeightRatio } from "../airframes";
import { computeForces, netInertialForce } from "../forces";
import { ISA_SEA_LEVEL } from "../types";
import type { Control, DroneState } from "../types";

const IDLE_STATE: DroneState = {
  t: 0,
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  attitude: [1, 0, 0, 0],
  angularVelocity: [0, 0, 0],
  batterySoc: 1.0,
  batteryVoltage: 25.2,
};

describe("hover analytical case", () => {
  it("requires thrust equal to weight at sea level", () => {
    const spec = getAirframe("dji-matrice-350-rtk");
    const W = hoverThrustN(spec);
    expect(W).toBeCloseTo(spec.massKg * 9.80665, 6);
  });

  it("computes hover throttle below max for all reference airframes", () => {
    for (const id of Object.keys(AIRFRAMES)) {
      const spec = getAirframe(id);
      const h = hoverThrottle(spec);
      expect(h).toBeGreaterThan(0);
      expect(h).toBeLessThan(1);
    }
  });

  it("thrust-to-weight ratio greater than 1.5 for inspection drones", () => {
    const ids = ["dji-mavic-3-enterprise", "dji-matrice-30t", "dji-matrice-350-rtk"];
    for (const id of ids) {
      const r = thrustToWeightRatio(getAirframe(id));
      expect(r).toBeGreaterThan(1.5);
    }
  });

  it("balanced control at hover throttle yields near-zero net inertial Z force", () => {
    const spec = getAirframe("dji-matrice-30t");
    const h = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(h) };
    const forces = computeForces(spec, IDLE_STATE, control, ISA_SEA_LEVEL);
    const F = netInertialForce(spec, IDLE_STATE, forces);
    expect(Math.abs(F[0])).toBeLessThan(1e-6);
    expect(Math.abs(F[1])).toBeLessThan(1e-6);
    expect(Math.abs(F[2])).toBeLessThan(0.05);
  });
});
