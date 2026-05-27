import { describe, it, expect, vi } from 'vitest';
import { MockBodySchemaAdapter } from '../src/adapters/mock';
import { EmbodimentProfile, RecommendedAction } from '../src/types/schema';

const profile: EmbodimentProfile = {
  profileId: 'figure-01' as any,
  vendor: 'TestVendor',
  model: 'TestModel',
  dofCount: 2,
  joints: [
    { jointId: 1, name: 'joint1', type: 'REVOLUTE', minPositionRad: -1, maxPositionRad: 1, maxVelocityRadS: 2, maxTorqueNm: 3, thermalLimitC: 100, actuatorModel: 'A1' },
    { jointId: 2, name: 'joint2', type: 'REVOLUTE', minPositionRad: -1, maxPositionRad: 1, maxVelocityRadS: 2, maxTorqueNm: 3, thermalLimitC: 100, actuatorModel: 'A2' },
  ],
  power: { batteryCapacityWh: 100, nominalVoltageV: 24, swapDurationS: 60, typicalRuntimeS: 3600 },
  thermal: { ambientMaxC: 50, ambientMinC: -10 },
  firmwareVersion: '1.0.0',
};

const config = {
  runtime: 'mock',
  embedDim: 256,
  reservoirSize: 1024,
  encoderThreshold: 0.1,
  stdp: { aPlus: 1, aMinus: 1, tauPlus: 1, tauMinus: 1, learningRate: 0.01 },
  dopamine: { baselineLevel: 0, rewardGain: 1, punishmentGain: 1, decayTauMs: 1000 },
  publishRateHz: { schemaState: 100, atlasUpstream: 1 },
  persistence: { checkpointIntervalS: 60, storageBackend: 'local-fs' },
};

describe('MockBodySchemaAdapter', () => {
  it('bootstrap → ingest → getSchemaState happy path', async () => {
    const adapter = new MockBodySchemaAdapter(config);
    await adapter.bootstrap('robot-1' as any, profile);
    adapter.ingestTelemetry('robot-1' as any, {
      robotId: 'robot-1' as any,
      timestamp: Date.now(),
      sequenceId: 1,
      jointPositionRad: new Float32Array([0, 0]),
      jointVelocityRadS: new Float32Array([0, 0]),
      jointCurrentA: new Float32Array([0, 0]),
      jointTempC: new Float32Array([25, 25]),
      jointTorqueNm: new Float32Array([0, 0]),
      imu: { accelX: 0, accelY: 0, accelZ: 0, gyroX: 0, gyroY: 0, gyroZ: 0 },
      contacts: [],
      taskContext: { skillId: 'skill-1' as any, skillPhase: 'idle', autonomy: 0 as any, payloadKg: 0, missionId: 'm1' as any },
    });
    const state = adapter.getSchemaState('robot-1' as any);
    expect(state.robotId).toBe('robot-1');
    expect(state.perJoint.length).toBe(2);
    expect(state.recommendedAction).toBe(RecommendedAction.NONE);
  });
});
