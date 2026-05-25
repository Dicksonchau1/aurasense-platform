import { PolygonEngineOrchestrator } from '@/src/lib/rehearse/orchestrator';
import type { RehearseSessionContext, TelemetryFrame, SubstrateAction, SceneEvent } from '@/src/lib/rehearse/types';

describe('PolygonEngineOrchestrator', () => {
  const context: RehearseSessionContext = {
    session_id: 's1',
    run_id: 'r1',
    substrate_run_id: 'sub1',
    deployment_id: 'dep1',
    domain: 'drone_inspection',
    geo: { lat: 1, lon: 2, alt_m: 3, radius_m: 4 },
    asset: { asset_class: 'drone' },
    conditions: { mode: 'test' } as any
  };
  const mockSubstrateClient = {
    inferFrame: jest.fn(),
    loadPriors: jest.fn()
  };
  const mockSignatureMapClient = {
    query: jest.fn(),
    contribute: jest.fn()
  };
  const broadcastSceneEvent = jest.fn();
  let orchestrator: PolygonEngineOrchestrator;

  beforeEach(() => {
    jest.clearAllMocks();
    orchestrator = new PolygonEngineOrchestrator({
      sessionId: 's1',
      runId: 'r1',
      substrateClient: mockSubstrateClient,
      signatureMapClient: mockSignatureMapClient,
      broadcastSceneEvent
    });
  });

  it('onSessionStart queries signature map and emits prior signature scene events', async () => {
    mockSignatureMapClient.query.mockResolvedValue([{ foo: 'bar' }]);
    await orchestrator.onSessionStart(context);
    expect(mockSignatureMapClient.query).toHaveBeenCalled();
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'prior_signature' }));
  });

  it('onTick routes correct:*, project:*, frame:*, flag:*', async () => {
    const actions: SubstrateAction[] = [
      { type: 'correct:pose', entity_id: 'e1', payload: {} },
      { type: 'project:trajectory', entity_id: 'e2', payload: {} },
      { type: 'frame:captured', entity_id: 'e3', payload: { modulator_score: 0.8 } },
      { type: 'flag:anomaly', entity_id: 'e4', payload: { message: 'Anomaly' } }
    ];
    mockSubstrateClient.inferFrame.mockResolvedValue({ actions });
    const telemetry: TelemetryFrame = { ts: 1, entity_id: 'ent1' };
    await orchestrator.onTick(context, telemetry);
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'correction_overlay' }));
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'projection_tube' }));
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'captured_frame_marker' }));
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'anomaly_marker' }));
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'toast' }));
  });

  it('onSessionEnd contributes only frames above threshold and emits toast', async () => {
    // Simulate capturedFrames
    (orchestrator as any).capturedFrames = [
      { frame_id: 'f1', substrate_run_id: 'sub1', modulator_score: 0.8, telemetry_snapshot: {}, substrate_action: { type: 'frame:captured', payload: { modulator_score: 0.8 } }, ts: 1 },
      { frame_id: 'f2', substrate_run_id: 'sub1', modulator_score: 0.6, telemetry_snapshot: {}, substrate_action: { type: 'frame:captured', payload: { modulator_score: 0.6 } }, ts: 2 }
    ];
    mockSignatureMapClient.contribute.mockResolvedValue({});
    const result = await orchestrator.onSessionEnd(context);
    expect(mockSignatureMapClient.contribute).toHaveBeenCalledTimes(1);
    expect(broadcastSceneEvent).toHaveBeenCalledWith('s1', expect.objectContaining({ entity_type: 'toast' }));
    expect(result.contributions).toBe(1);
  });
});
