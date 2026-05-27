import {
  AnomalyEvent,
  ServiceRequestEvent,
  PlasticityMilestoneEvent,
} from '@nepa/body-schema/types/events';
import { BodySchemaState } from '@nepa/body-schema/types/schema';

/**
 * The contract ATLAS implements to consume NEPA body-schema outputs.
 * One implementation lives in apps/atlas-orchestrator.
 */
export interface AtlasBodySchemaBridge {
  /** Periodic schema state push (1 Hz). Updates LimbHealth dashboard. */
  onSchemaState(state: BodySchemaState): Promise<void>;

  /** Anomaly fired by NEPA. ATLAS decides response under policy gates. */
  onAnomaly(event: AnomalyEvent): Promise<void>;

  /**
   * NEPA recommends preemptive service. ATLAS responds by reserving
   * a ServiceBay and issuing a REQUEST_SERVICE mission with
   * LIMITED_HUMAN_OVERLAY for technician confirmation.
   */
  onServiceRequest(event: ServiceRequestEvent): Promise<ServiceRequestAck>;

  /** Plasticity milestone — used for fleet maturity dashboards. */
  onPlasticityMilestone(event: PlasticityMilestoneEvent): Promise<void>;
}

export interface ServiceRequestAck {
  accepted: boolean;
  scheduledAt: number;             // ms epoch
  serviceBayId: string;
  estimatedDowntimeS: number;
  missionId: string;
  reason?: string;
}
