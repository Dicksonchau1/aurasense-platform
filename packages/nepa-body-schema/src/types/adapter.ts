import {
  BodySchemaState,
  EmbodimentProfile,
  RobotId,
  SerializedSchema,
} from './schema';
import { TelemetryFrame } from './telemetry';
import { BodySchemaEvent } from './events';

export interface BootstrapOptions {
  performCalibrationDance?: boolean;
  importPriorSchema?: SerializedSchema;
  initialAutonomyLevel?: 'L1_SUGGEST' | 'L2_SUPERVISED';
}

export interface BodySchemaAdapter {
  /** Register a robot with its embodiment profile. Idempotent. */
  bootstrap(
    robotId: RobotId,
    profile: EmbodimentProfile,
    opts?: BootstrapOptions,
  ): Promise<void>;

  /** Hot path: ingest a telemetry frame at native rate (≥1 kHz). Non-blocking. */
  ingestTelemetry(robotId: RobotId, frame: TelemetryFrame): void;

  /** Read current schema state. Lock-free; returns latest published snapshot. */
  getSchemaState(robotId: RobotId): BodySchemaState;

  /** Subscribe to all schema events for a robot. */
  subscribe(
    robotId: RobotId,
    handler: (event: BodySchemaEvent) => void,
  ): () => void; // returns unsubscribe

  /** Export full serialized schema (for transfer, replication, persistence). */
  exportSchema(robotId: RobotId): Promise<SerializedSchema>;

  /** Import a serialized schema (e.g., warm-starting a new robot). */
  importSchema(robotId: RobotId, schema: SerializedSchema): Promise<void>;

  /** Force schema persistence checkpoint. */
  checkpoint(robotId: RobotId): Promise<void>;

  /** Graceful shutdown — flushes plasticity state to durable storage. */
  shutdown(robotId: RobotId): Promise<void>;
}

export interface BodySchemaAdapterFactory {
  create(config: AdapterConfig): BodySchemaAdapter;
}

export interface AdapterConfig {
  runtime: 'loihi2' | 'jetson' | 'cpu' | 'mock';
  embedDim: number;                     // default 256
  reservoirSize: number;                // default 1024
  encoderThreshold: number;             // delta-mod threshold
  stdp: {
    aPlus: number;
    aMinus: number;
    tauPlus: number;
    tauMinus: number;
    learningRate: number;
  };
  dopamine: {
    baselineLevel: number;
    rewardGain: number;
    punishmentGain: number;
    decayTauMs: number;
  };
  publishRateHz: {
    schemaState: number;                // default 100 (local)
    atlasUpstream: number;              // default 1
  };
  persistence: {
    checkpointIntervalS: number;
    storageBackend: 'supabase' | 'local-fs' | 's3';
  };
  federated?: {
    enabled: boolean;
    tenantId: string;
    aggregatorUrl: string;
    differentialPrivacyEpsilon: number;
  };
}
