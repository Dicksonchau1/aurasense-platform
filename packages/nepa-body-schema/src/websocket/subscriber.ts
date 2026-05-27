import { BodySchemaEvent } from '../types/events';
import { BodySchemaState, RobotId } from '../types/schema';
import { WSEnvelope } from './publisher';

export type SchemaStateHandler = (state: BodySchemaState) => void;
export type EventHandler = (event: BodySchemaEvent) => void;

export interface BodySchemaSubscriber {
  subscribeRobot(robotId: RobotId, h: SchemaStateHandler): () => void;
  subscribeRobotEvents(robotId: RobotId, h: EventHandler): () => void;
  subscribeTenant(tenantId: string, h: (env: WSEnvelope<unknown>) => void): () => void;
  close(): Promise<void>;
}
