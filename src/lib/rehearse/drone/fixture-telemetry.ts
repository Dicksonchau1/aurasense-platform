import { TelemetryFrame } from '../orchestrator';

export function generateOrbitTelemetry(
  t: number,
  radius: number,
  altitude: number
): TelemetryFrame {
  const angle = (t / 20) % (2 * Math.PI);
  return {
    ts: Date.now(),
    position: {
      x: radius * Math.cos(angle),
      y: altitude,
      z: radius * Math.sin(angle),
    },
    velocity: {
      x: -radius * Math.sin(angle),
      y: 0,
      z: radius * Math.cos(angle),
    },
    orientation: { x: 0, y: angle, z: 0 },
    payload: null,
    extra: {},
  };
}
