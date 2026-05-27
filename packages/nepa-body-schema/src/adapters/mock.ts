import { BaseBodySchemaAdapter } from './base';
import {
  BodySchemaState,
  EmbodimentProfile,
  RecommendedAction,
  RobotId,
  SerializedSchema,
} from '../types/schema';
import { TelemetryFrame } from '../types/telemetry';

export class MockBodySchemaAdapter extends BaseBodySchemaAdapter {
  private state = new Map<RobotId, BodySchemaState>();

  async bootstrap(robotId: RobotId, profile: EmbodimentProfile): Promise<void> {
    this.profiles.set(robotId, profile);
    this.state.set(robotId, this.makeNominalState(robotId, profile));
  }

  ingestTelemetry(robotId: RobotId, frame: TelemetryFrame): void {
    // Mock: linear wear injection per joint based on torque history
    const s = this.state.get(robotId);
    if (!s) return;
    s.timestamp = frame.timestamp;
    s.operationalHours += 1 / 3600 / this.config.publishRateHz.schemaState;
    // …degrade per-joint health proportional to torque
  }

  getSchemaState(robotId: RobotId): BodySchemaState {
    const s = this.state.get(robotId);
    if (!s) throw new Error(`No state for ${robotId}`);
    return s;
  }

  async exportSchema(robotId: RobotId): Promise<SerializedSchema> { /* … */ throw 0; }
  async importSchema(): Promise<void> { /* … */ }
  async checkpoint(): Promise<void> { /* … */ }
  async shutdown(): Promise<void> { /* … */ }

  private makeNominalState(robotId: RobotId, p: EmbodimentProfile): BodySchemaState {
    return {
      robotId,
      timestamp: Date.now(),
      embedding: new Float32Array(this.config.embedDim),
      confidence: 1.0,
      noveltyScore: 0,
      schemaVersion: 1,
      perJoint: p.joints.map(j => ({
        jointId: j.jointId,
        healthScore: 1.0,
        estimatedRulHours: 2000,
        wearVelocity: 0,
        activeModes: [],
      })),
      thermalMarginC: p.joints.map(j => j.thermalLimitC - 25),
      recommendedAction: RecommendedAction.NONE,
      recommendationReason: 'nominal',
      operationalHours: 0,
      plasticity: {
        currentDopamineLevel: 0,
        stdpUpdatesCount: 0,
        weightNorm: 1.0,
        calibrationComplete: false,
      },
    };
  }
}
