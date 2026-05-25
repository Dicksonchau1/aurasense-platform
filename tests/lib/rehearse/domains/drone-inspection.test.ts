import { droneContextToSessionContext, droneTelemetryToFrame, DroneInspectionContext } from '../../../../src/lib/rehearse/domains/drone-inspection';

describe('droneContextToSessionContext', () => {
  it('produces correct asset_class', () => {
    const ctx: DroneInspectionContext = {
      structure_type: 'bridge',
      structure_id: 'b1',
      geo: { lat: 0, lon: 0, alt_m: 0, radius_m: 1 },
      conditions: { wind_speed_ms: 1, wind_dir_deg: 0, payload_kg: 1 },
    };
    const session = droneContextToSessionContext(ctx, 'sid', 'rid', 'srid', 'did');
    expect(session.asset_class).toBe('bridge');
    expect(session.asset_id).toBe('b1');
  });
});

describe('droneTelemetryToFrame', () => {
  it('maps position/velocity correctly', () => {
    const raw = {
      ts: 123,
      position: { x: 1, y: 2, z: 3 },
      velocity: { x: 0.1, y: 0.2, z: 0.3 },
      orientation: { x: 0, y: 0, z: 0 },
      payload: 2,
      extra: { foo: 'bar' },
    };
    const frame = droneTelemetryToFrame(raw);
    expect(frame.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(frame.velocity).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
  });
});
