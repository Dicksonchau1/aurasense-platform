import { normaliseFrame, isHighModulatorFrame } from '@/src/lib/rehearse/frame-normaliser';
import type { FrameExcerpt } from '@/src/lib/rehearse/frame-normaliser';
import type { RehearseSessionContext, SubstrateAction } from '@/src/lib/rehearse/types';

describe('frame-normaliser', () => {
  const session: RehearseSessionContext = {
    session_id: 's1',
    run_id: 'r1',
    substrate_run_id: 'sub1',
    deployment_id: 'dep1',
    domain: 'drone_inspection',
    geo: { lat: 1, lon: 2, alt_m: 3, radius_m: 4 },
    asset: { asset_class: 'drone' },
    conditions: { mode: 'test' } as any
  };
  const baseFrame: FrameExcerpt = {
    frame_id: 'f1',
    substrate_run_id: 'sub1',
    modulator_score: 0.8,
    telemetry_snapshot: {},
    substrate_action: { type: 'correct:pose', payload: { foo: 'bar' } } as SubstrateAction,
    ts: 123
  };

  it('returns anchors from session context', () => {
    const result = normaliseFrame(baseFrame, session);
    expect(result.geometric_anchor).toEqual(session.geo);
    expect(result.structural_anchor).toEqual(session.asset);
    expect(result.operational_regime).toEqual(session.conditions);
  });

  it('maps action type to extracted signature type', () => {
    const types = [
      ['correct:pose', 'scene_correction'],
      ['project:foo', 'projection_signature'],
      ['flag:anomaly', 'anomaly_signature'],
      ['frame:captured', 'captured_frame_signature'],
      ['other', 'unknown_signature']
    ];
    for (const [type, expected] of types) {
      const frame = { ...baseFrame, substrate_action: { type, payload: {} } };
      const result = normaliseFrame(frame, session);
      expect(result.extracted_signature.signature_type).toBe(expected);
    }
  });

  it('isHighModulatorFrame threshold behavior', () => {
    expect(isHighModulatorFrame({ ...baseFrame, modulator_score: 0.8 }, 0.7)).toBe(true);
    expect(isHighModulatorFrame({ ...baseFrame, modulator_score: 0.6 }, 0.7)).toBe(false);
  });
});
