// PPI radar seed objects + sweep helper for the Robot > Radar sub-tab.

export interface RadarObject {
  a: number; // angle in radians
  r: number; // normalized radius [0..1]
  l: string; // label
}

export const RDR_OBJS: RadarObject[] = [
  { a: 0.8, r: 0.45, l: "Building A" },
  { a: 2.1, r: 0.62, l: "Tower B" },
  { a: 3.8, r: 0.30, l: "Obstacle" },
  { a: 5.2, r: 0.55, l: "Structure" },
];

export function brightnessFor(sweepAngle: number, objAngle: number): number {
  const tau = Math.PI * 2;
  const diff = ((sweepAngle - objAngle) % tau + tau) % tau;
  return diff < 0.35 ? 1 - diff / 1.6 : 1.25 * 0.08;
}
