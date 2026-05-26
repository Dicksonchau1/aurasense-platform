import { describe, it, expect } from "vitest";
import { getAirframe, hoverThrottle } from "../airframes";
import { rk4Step } from "../integrator";
import { ISA_SEA_LEVEL } from "../types";
import type { Control, DroneState } from "../types";

function makeState(zVel: number): DroneState {
  return {
    t: 0,
    position: [0, 0, 0],
    velocity: [0, 0, zVel],
    attitude: [1, 0, 0, 0],
    angularVelocity: [0, 0, 0],
    batterySoc: 1.0,
    batteryVoltage: 25.2,
  };
}

describe("constant-velocity climb", () => {
  it("at hover throttle and zero velocity, vertical velocity stays small over 1s", () => {
    const spec = getAirframe("dji-matrice-30t");
    const h = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(h) };
    let state = makeState(0);
    const dt = 0.01;
    for (let i = 0; i < 100; i++) {
      const step = rk4Step(spec, state, control, ISA_SEA_LEVEL, dt);
      state = step.after;
    }
    expect(Math.abs(state.velocity[2])).toBeLessThan(0.5);
  });

  it("battery SoC decreases monotonically under load", () => {
    const spec = getAirframe("dji-matrice-30t");
    const h = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(h) };
    let state = makeState(0);
    const dt = 0.05;
    let prev = state.batterySoc;
    for (let i = 0; i < 200; i++) {
      const step = rk4Step(spec, state, control, ISA_SEA_LEVEL, dt);
      expect(step.after.batterySoc).toBeLessThanOrEqual(prev + 1e-9);
      prev = step.after.batterySoc;
      state = step.after;
    }
    expect(state.batterySoc).toBeLessThan(1.0);
    expect(state.batterySoc).toBeGreaterThan(0);
  });

  it("zero throttle causes free fall: Z velocity grows positive (NED down)", () => {
    const spec = getAirframe("dji-mavic-3-enterprise");
    const control: Control = { throttle: Array(spec.motorCount).fill(0) };
    let state = makeState(0);
    const dt = 0.01;
    for (let i = 0; i < 100; i++) {
      const step = rk4Step(spec, state, control, ISA_SEA_LEVEL, dt);
      state = step.after;
    }
    expect(state.velocity[2]).toBeGreaterThan(5);
    expect(state.velocity[2]).toBeLessThan(15);
  });
});
