import { describe, it, expect } from "vitest";
import { getAirframe, hoverThrottle } from "../airframes";
import { rk4Step } from "../integrator";
import { ISA_SEA_LEVEL } from "../types";
import { quatNorm } from "../body-frame";
import type { Control, DroneState } from "../types";

const REST: DroneState = {
  t: 0,
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  attitude: [1, 0, 0, 0],
  angularVelocity: [0, 0, 0],
  batterySoc: 1.0,
  batteryVoltage: 25.2,
};

describe("integrator invariants", () => {
  it("rejects dt <= 0", () => {
    const spec = getAirframe("dji-matrice-30t");
    const control: Control = { throttle: Array(spec.motorCount).fill(0.5) };
    expect(() => rk4Step(spec, REST, control, ISA_SEA_LEVEL, 0)).toThrow();
    expect(() => rk4Step(spec, REST, control, ISA_SEA_LEVEL, -0.01)).toThrow();
  });

  it("rejects mismatched control channel count", () => {
    const spec = getAirframe("dji-matrice-30t");
    const wrong: Control = { throttle: [0.5, 0.5, 0.5] };
    expect(() => rk4Step(spec, REST, wrong, ISA_SEA_LEVEL, 0.01)).toThrow();
  });

  it("attitude quaternion stays unit-norm under prolonged integration", () => {
    const spec = getAirframe("dji-matrice-350-rtk");
    const h = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(h) };
    let state = REST;
    for (let i = 0; i < 500; i++) {
      const step = rk4Step(spec, state, control, ISA_SEA_LEVEL, 0.02);
      state = step.after;
      const n = quatNorm(state.attitude);
      expect(Math.abs(n - 1)).toBeLessThan(1e-3);
    }
  });

  it("produces finite state after 1000 steps at random-ish throttle", () => {
    const spec = getAirframe("dji-matrice-30t");
    const h = hoverThrottle(spec);
    let state = REST;
    for (let i = 0; i < 1000; i++) {
      const jitter = 0.02 * Math.sin(i * 0.13);
      const control: Control = { throttle: spec.motorCount === 4
        ? [h + jitter, h - jitter, h + jitter, h - jitter]
        : Array(spec.motorCount).fill(h) };
      const step = rk4Step(spec, state, control, ISA_SEA_LEVEL, 0.01);
      state = step.after;
    }
    for (const v of state.position) expect(Number.isFinite(v)).toBe(true);
    for (const v of state.velocity) expect(Number.isFinite(v)).toBe(true);
    for (const v of state.angularVelocity) expect(Number.isFinite(v)).toBe(true);
    for (const v of state.attitude) expect(Number.isFinite(v)).toBe(true);
  });

  it("energy drawn per step is positive and proportional to dt", () => {
    const spec = getAirframe("dji-matrice-30t");
    const h = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(h) };
    const stepShort = rk4Step(spec, REST, control, ISA_SEA_LEVEL, 0.01);
    const stepLong = rk4Step(spec, REST, control, ISA_SEA_LEVEL, 0.02);
    expect(stepShort.energyJ).toBeGreaterThan(0);
    expect(stepLong.energyJ).toBeGreaterThan(stepShort.energyJ * 1.5);
    expect(stepLong.energyJ).toBeLessThan(stepShort.energyJ * 2.5);
  });
});
