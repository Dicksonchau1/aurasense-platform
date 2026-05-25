import { generateOrbitTelemetry } from '../../../../src/lib/rehearse/drone/fixture-telemetry';

describe('generateOrbitTelemetry', () => {
  it('produces valid TelemetryFrame at t=0, t=10, t=100', () => {
    const t0 = generateOrbitTelemetry(0, 10, 5);
    const t10 = generateOrbitTelemetry(10, 10, 5);
    const t100 = generateOrbitTelemetry(100, 10, 5);
    expect(t0.position.y).toBe(5);
    expect(t10.position.y).toBe(5);
    expect(t100.position.y).toBe(5);
  });
  it('position.x and position.z are bounded by radius', () => {
    const t = generateOrbitTelemetry(25, 10, 5);
    expect(Math.abs(t.position.x)).toBeLessThanOrEqual(10);
    expect(Math.abs(t.position.z)).toBeLessThanOrEqual(10);
  });
  it('ts is monotonically increasing', () => {
    const t1 = generateOrbitTelemetry(1, 10, 5);
    const t2 = generateOrbitTelemetry(2, 10, 5);
    expect(t2.ts).toBeGreaterThanOrEqual(t1.ts);
  });
});
