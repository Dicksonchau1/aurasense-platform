import { BaseBodySchemaAdapter } from './base';
import { AdapterConfig, BootstrapOptions } from '../types/adapter';
import { BodySchemaState, EmbodimentProfile, RobotId, SerializedSchema, RecommendedAction } from '../types/schema';
import { TelemetryFrame } from '../types/telemetry';
import { NorseCpuRuntime } from '../runtime/cpu';

export class CpuBodySchemaAdapter extends BaseBodySchemaAdapter {
  private state = new Map<RobotId, BodySchemaState>();
  private runtime = new Map<RobotId, NorseCpuRuntime>();

  constructor(config: AdapterConfig) {
    super(config);
  }

  async bootstrap(robotId: RobotId, profile: EmbodimentProfile, opts?: BootstrapOptions): Promise<void> {
    this.profiles.set(robotId, profile);
    this.runtime.set(robotId, new NorseCpuRuntime({
      embedDim: this.config.embedDim,
      reservoirSize: this.config.reservoirSize,
      encoderThreshold: this.config.encoderThreshold,
      stdp: this.config.stdp,
      dopamine: this.config.dopamine,
    }));
    // TODO: Initialize state from profile
    this.state.set(robotId, {
      robotId,
      timestamp: Date.now(),
      embedding: new Float32Array(this.config.embedDim),
      confidence: 1.0,
      noveltyScore: 0,
      schemaVersion: 1,
      perJoint: profile.joints.map(j => ({
        jointId: j.jointId,
        healthScore: 1.0,
        estimatedRulHours: 2000,
        wearVelocity: 0,
        activeModes: [],
      })),
      thermalMarginC: profile.joints.map(j => j.thermalLimitC - 25),
      recommendedAction: RecommendedAction.NONE,
      recommendationReason: 'nominal',
      operationalHours: 0,
      plasticity: {
        currentDopamineLevel: 0,
        stdpUpdatesCount: 0,
        weightNorm: 1.0,
        calibrationComplete: false,
      },
    });
  }

  ingestTelemetry(robotId: RobotId, frame: TelemetryFrame): void {
    const runtime = this.runtime.get(robotId);
    if (!runtime) return;
    runtime.ingestTelemetry(/* frame */);
    // TODO: Update state from runtime output
  }

  getSchemaState(robotId: RobotId): BodySchemaState {
    const s = this.state.get(robotId);
    if (!s) throw new Error(`No state for ${robotId}`);
    return s;
  }

  async exportSchema(robotId: RobotId): Promise<SerializedSchema> { throw new Error('Not implemented'); }
  async importSchema(robotId: RobotId, schema: SerializedSchema): Promise<void> { throw new Error('Not implemented'); }
  async checkpoint(robotId: RobotId): Promise<void> { throw new Error('Not implemented'); }
  async shutdown(robotId: RobotId): Promise<void> { throw new Error('Not implemented'); }
}
