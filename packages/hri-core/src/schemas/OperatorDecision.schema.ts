import { z } from 'zod';
import { OperatorActionSchema } from './OperatorAction.schema';
export const OperatorDecisionSchema = z.object({
  decisionId: z.string(),
  action: OperatorActionSchema,
  decision: z.enum(['acknowledge', 'correct', 'override']),
  rationale: z.string().optional(),
  decidedAt: z.string(),
});
