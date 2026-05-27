import { describe, it, expect } from "vitest";
import { computePosture, computeFraming, computeGaze, computeMetrics } from "./metrics";
import type { PoseLandmarks, FaceLandmarks } from "./types";

function makePose(overrides: Partial<Record<number, { x: number; y: number; z: number }>> = {}): PoseLandmarks {
  const pts = Array.from({ length: 33 }, (_, i) => ({
    x: overrides[i]?.x ?? 0.5,
    y: overrides[i]?.y ?? 0.5,
    z: overrides[i]?.z ?? 0,
    visibility: 1,
  }));
  return { ts_ms: 0, points: pts, confidence: 1 };
}

describe("computePosture", () => {
  it("returns 100 when shoulders level and torso vertical", () => {
    const pose = makePose({
      11: { x: 0.4, y: 0.3, z: 0 },  // left shoulder
      12: { x: 0.6, y: 0.3, z: 0 },  // right shoulder
      23: { x: 0.4, y: 0.7, z: 0 },  // left hip
      24: { x: 0.6, y: 0.7, z: 0 },  // right hip
    });
    expect(computePosture(pose)).toBeGreaterThan(95);
  });

  it("drops below 50 when one shoulder is 20% lower", () => {
    const pose = makePose({
      11: { x: 0.4, y: 0.3, z: 0 },
      12: { x: 0.6, y: 0.5, z: 0 },  // dropped right shoulder
      23: { x: 0.4, y: 0.7, z: 0 },
      24: { x: 0.6, y: 0.7, z: 0 },
    });
    expect(computePosture(pose)).toBeLessThan(50);
  });
});

describe("computeFraming", () => {
  it("returns ~100 when nose at center upper third", () => {
    const pose = makePose({ 0: { x: 0.5, y: 0.35, z: 0 } });
    expect(computeFraming(pose)).toBeGreaterThan(95);
  });

  it("drops when nose far from center", () => {
    const pose = makePose({ 0: { x: 0.9, y: 0.35, z: 0 } });
    expect(computeFraming(pose)).toBeLessThan(40);
  });
});

describe("computeGaze", () => {
  it("returns ~100 when gaze centered", () => {
    const face: FaceLandmarks = {
      ts_ms: 0, points: [], gaze: { x: 0, y: 0 }, confidence: 1,
    };
    expect(computeGaze(face)).toBeGreaterThan(95);
  });
});

describe("computeMetrics consistency", () => {
  it("approaches 1 with stable history", () => {
    const history = Array.from({ length: 20 }, () => ({
      posture: 80, framing: 80, gaze: 80, envelope: 50, consistency: 0,
    }));
    const m = computeMetrics({ pose: null, face: null, history });
    expect(m.consistency).toBeGreaterThan(0.9);
  });
});