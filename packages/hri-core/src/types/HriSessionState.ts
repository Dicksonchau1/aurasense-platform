import { HriSessionStatus } from './HriSessionStatus';
import { HriTimelineEvent } from './HriTimelineEvent';
import { HriRole } from './HriRole';
import { AgentRecommendation } from './AgentRecommendation';
import { PerceptionSummary } from './PerceptionSummary';
import { TrustEnvelope } from './TrustEnvelope';
import { PolicyReceiptRef } from './PolicyReceiptRef';
import { OperatorAction } from './OperatorAction';
import { OperatorDecision } from './OperatorDecision';
import { InterventionRequest } from './InterventionRequest';

export interface HriSessionState {
  sessionId: string;
  status: HriSessionStatus;
  role: HriRole;
  timeline: HriTimelineEvent[];
  currentRecommendation?: AgentRecommendation;
  outstandingHumanAction?: OperatorAction;
  trustEnvelope?: TrustEnvelope;
  policyReceipts?: PolicyReceiptRef[];
  perception?: PerceptionSummary;
  operatorDecisions?: OperatorDecision[];
  interventionRequests?: InterventionRequest[];
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
}
