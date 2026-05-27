import type { PoseLandmarks, FaceLandmarks, Metrics } from "./types";

// BlazePose landmark indices we care about
const LM_LEFT_SHOULDER = 11;
const LM_RIGHT_SHOULDER = 12;
const LM_LEFT_HIP = 23;
const LM_RIGHT_HIP = 24;
const LM_NOSE = 0;

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

export function computePosture(pose: PoseLandmarks | null): number {
  if (!pose || pose.points.length < 25) return 0;
  const ls = pose.points[LM_LEFT_SHOULDER];
  const rs = pose.points[LM_RIGHT_SHOULDER];
  const lh = pose.points[LM_LEFT_HIP];
  const rh = pose.points[LM_RIGHT_HIP];

  // Shoulder level: y delta between shoulders should be small
  const shoulderDelta = Math.abs(ls.y - rs.y);
  const shoulderScore = clamp(100 - shoulderDelta * 800);

  // Torso vertical: midpoint of shoulders should be roughly above midpoint of hips
  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const torsoLean = Math.abs(shoulderMid.x - hipMid.x);
  const leanScore = clamp(100 - torsoLean * 600);

  return clamp((shoulderScore + leanScore) / 2);
}

export function computeFraming(pose: PoseLandmarks | null): number {
  if (!pose) return 0;
  const nose = pose.points[LM_NOSE];
  if (!nose) return 0;

  // Nose should be near horizontal center and upper-third vertically
  const xDistFromCenter = Math.abs(nose.x - 0.5);
  const yDistFromIdeal = Math.abs(nose.y - 0.35);

  return clamp(100 - (xDistFromCenter * 200 + yDistFromIdeal * 150));
}

export function computeGaze(face: FaceLandmarks | null): number {
  if (!face) return 0;
  // Gaze.x/y are offsets from center (-0.5 .. 0.5)
  const mag = Math.sqrt(face.gaze.x * face.gaze.x + face.gaze.y * face.gaze.y);
  return clamp(100 - mag * 250);
}

export function computeMetrics(args: {
  pose: PoseLandmarks | null;
  face: FaceLandmarks | null;
  envelope?: number;
  history?: Metrics[];
}): Metrics {
  const posture = computePosture(args.pose);
  const framing = computeFraming(args.pose);
  const gaze = computeGaze(args.face);
  const envelope = args.envelope ?? 50;

  // Consistency = 1 - normalized std-dev of last N postures
  const hist = (args.history ?? []).slice(-30).map((m) => m.posture);
  let consistency = 0.7;
  if (hist.length > 5) {
    const mean = hist.reduce((s, x) => s + x, 0) / hist.length;
    const variance = hist.reduce((s, x) => s + (x - mean) ** 2, 0) / hist.length;
    const stdev = Math.sqrt(variance);
    consistency = Math.max(0, 1 - stdev / 50);
  }

  return { posture, framing, gaze, envelope, consistency };
}