import { describe, it, expect } from 'vitest';
import { CpuBodySchemaAdapter } from '../src/adapters/cpu';
import { EmbodimentProfile } from '../src/types/schema';

describe('CpuBodySchemaAdapter', () => {
  it('should bootstrap and create runtime for robot', async () => {
    const config = {
      runtime: 'cpu',
      embedDim: 256,
      reservoirSize: 1024,
      encoderThreshold: 0.1,
      stdp: { aPlus: 1, aMinus: 1, tauPlus: 1, tauMinus: 1, learningRate: 0.01 },
      dopamine: { baselineLevel: 0, rewardGain: 1, punishmentGain: 1, decayTauMs: 1000 },
      publishRateHz: { schemaState: 100, atlasUpstream: 1 },
      persistence: { checkpointIntervalS: 60, storageBackend: 'local-fs' },
    };
    const profile: EmbodimentProfile = {
      profileId: 'figure-01' as any,
      vendor: 'TestVendor',
      model: 'TestModel',
      dofCount: 1,
      joints: [
        { jointId: 1, name: 'joint1', type: 'REVOLUTE', minPositionRad: -1, maxPositionRad: 1, maxVelocityRadS: 2, maxTorqueNm: 3, thermalLimitC: 100, actuatorModel: 'A1' },
      ],
      power: { batteryCapacityWh: 100, nominalVoltageV: 24, swapDurationS: 60, typicalRuntimeS: 3600 },
      thermal: { ambientMaxC: 50, ambientMinC: -10 },
      firmwareVersion: '1.0.0',
    };
    const adapter = new CpuBodySchemaAdapter(config);
    await adapter.bootstrap('robot-1' as any, profile);
    const state = adapter.getSchemaState('robot-1' as any);
    expect(state.robotId).toBe('robot-1');
    expect(state.perJoint.length).toBe(1);
  });
});
