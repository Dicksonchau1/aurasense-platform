import { AnomalySeverity, RecommendedAction, RobotId, BodySchemaState } from './schema';

export interface AnomalyEvent {
  robotId: RobotId;
  timestamp: number;
  eventId: string;
  severity: AnomalySeverity;
  attributedJointIds: number[];
  reconstructionError: number;
  zScore: number;
  description: string;
  evidenceWindow?: Uint8Array;
}

export interface ServiceRequestEvent {
  robotId: RobotId;
  timestamp: number;
  jointIds: number[];
  urgency: 'preemptive' | 'scheduled' | 'urgent' | 'emergency';
  estimatedRulHours: number;
  recommendedAction: RecommendedAction;
  schemaVersion: number;
}

export interface PlasticityMilestoneEvent {
  robotId: RobotId;
  timestamp: number;
  milestone: 'CALIBRATION_COMPLETE' | 'SCHEMA_MATURE' | 'MAJOR_DRIFT' | 'VERSION_BUMP';
  previousVersion: number;
  newVersion: number;
}

export type BodySchemaEvent =
  | { type: 'SCHEMA_STATE'; payload: BodySchemaState }
  | { type: 'ANOMALY'; payload: AnomalyEvent }
  | { type: 'SERVICE_REQUEST'; payload: ServiceRequestEvent }
  | { type: 'PLASTICITY_MILESTONE'; payload: PlasticityMilestoneEvent };
