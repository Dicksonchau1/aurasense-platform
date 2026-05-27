import {
  BodySchemaAdapter,
  AdapterConfig,
} from '../types/adapter';
import {
  BodySchemaState,
  EmbodimentProfile,
  RobotId,
  SerializedSchema,
} from '../types/schema';
import { TelemetryFrame } from '../types/telemetry';
import { BodySchemaEvent } from '../types/events';

export abstract class BaseBodySchemaAdapter implements BodySchemaAdapter {
  protected readonly profiles = new Map<RobotId, EmbodimentProfile>();
  protected readonly subscribers = new Map<RobotId, Set<(e: BodySchemaEvent) => void>>();

  constructor(protected readonly config: AdapterConfig) {}

  abstract bootstrap(
    robotId: RobotId,
    profile: EmbodimentProfile,
    opts?: import('../types/adapter').BootstrapOptions,
  ): Promise<void>;

  abstract ingestTelemetry(robotId: RobotId, frame: TelemetryFrame): void;
  abstract getSchemaState(robotId: RobotId): BodySchemaState;
  abstract exportSchema(robotId: RobotId): Promise<SerializedSchema>;
  abstract importSchema(robotId: RobotId, schema: SerializedSchema): Promise<void>;
  abstract checkpoint(robotId: RobotId): Promise<void>;
  abstract shutdown(robotId: RobotId): Promise<void>;

  subscribe(robotId: RobotId, handler: (e: BodySchemaEvent) => void): () => void {
    if (!this.subscribers.has(robotId)) this.subscribers.set(robotId, new Set());
    this.subscribers.get(robotId)!.add(handler);
    return () => this.subscribers.get(robotId)?.delete(handler);
  }

  protected emit(robotId: RobotId, event: BodySchemaEvent) {
    this.subscribers.get(robotId)?.forEach(h => h(event));
  }
}
