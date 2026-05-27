import { RobotId } from '../types/schema';

export const Topics = {
  schemaState: (robotId: RobotId) => `/robots/${robotId}/body_schema/state`,
  anomaly: (robotId: RobotId) => `/robots/${robotId}/body_schema/anomaly`,
  serviceRequest: (robotId: RobotId) => `/robots/${robotId}/body_schema/service`,
  plasticity: (robotId: RobotId) => `/robots/${robotId}/body_schema/plasticity`,

  fleetSummary: (tenantId: string) => `/tenants/${tenantId}/body_schema/summary`,
  fleetAnomalies: (tenantId: string) => `/tenants/${tenantId}/body_schema/anomalies`,
} as const;

export type TopicPattern =
  | `/robots/${string}/body_schema/state`
  | `/robots/${string}/body_schema/anomaly`
  | `/robots/${string}/body_schema/service`
  | `/robots/${string}/body_schema/plasticity`
  | `/tenants/${string}/body_schema/summary`
  | `/tenants/${string}/body_schema/anomalies`;
