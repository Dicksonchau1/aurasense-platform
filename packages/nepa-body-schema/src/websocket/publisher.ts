import { BodySchemaEvent } from '../types/events';
import { BodySchemaState, RobotId } from '../types/schema';
import { Topics } from './topics';

export interface WSEnvelope<T> {
  v: 1;
  topic: string;
  ts: number;
  robotId: RobotId;
  payload: T;
}

export interface BodySchemaPublisher {
  publishSchemaState(state: BodySchemaState): Promise<void>;
  publishEvent(event: BodySchemaEvent): Promise<void>;
  publishFleetSummary(tenantId: string, summary: FleetSummary): Promise<void>;
}

export interface FleetSummary {
  tenantId: string;
  timestamp: number;
  robotsActive: number;
  robotsInService: number;
  averageHealthScore: number;
  totalOperationalHours: number;
  pendingServiceRequests: number;
  worstRulHours: number;
  worstRulRobotId: RobotId | null;
}

export function envelope<T>(
  topic: string,
  robotId: RobotId,
  payload: T,
): WSEnvelope<T> {
  return { v: 1, topic, ts: Date.now(), robotId, payload };
}

export const ChannelExamples = {
  schemaState: (robotId: RobotId, payload: BodySchemaState) =>
    envelope(Topics.schemaState(robotId), robotId, payload),
};
