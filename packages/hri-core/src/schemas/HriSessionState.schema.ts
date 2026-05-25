import { z } from 'zod';
import { HriSessionStatusSchema } from './HriSessionStatus.schema';
import { HriTimelineEventSchema } from './HriTimelineEvent.schema';
import { HriRoleSchema } from './HriRole.schema';
import { AgentRecommendationSchema } from './AgentRecommendation.schema';
import { PerceptionSummarySchema } from './PerceptionSummary.schema';
import { TrustEnvelopeSchema } from './TrustEnvelope.schema';
import { PolicyReceiptRefSchema } from './PolicyReceiptRef.schema';
import { OperatorActionSchema } from './OperatorAction.schema';
import { OperatorDecisionSchema } from './OperatorDecision.schema';
import { InterventionRequestSchema } from './InterventionRequest.schema';

export const HriSessionStateSchema = z.object({
  sessionId: z.string(),
  status: HriSessionStatusSchema,
  role: HriRoleSchema,
  timeline: z.array(HriTimelineEventSchema),
  currentRecommendation: AgentRecommendationSchema.optional(),
  outstandingHumanAction: OperatorActionSchema.optional(),
  trustEnvelope: TrustEnvelopeSchema.optional(),
  policyReceipts: z.array(PolicyReceiptRefSchema).optional(),
  perception: PerceptionSummarySchema.optional(),
  operatorDecisions: z.array(OperatorDecisionSchema).optional(),
  interventionRequests: z.array(InterventionRequestSchema).optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  failedAt: z.string().optional(),
});
