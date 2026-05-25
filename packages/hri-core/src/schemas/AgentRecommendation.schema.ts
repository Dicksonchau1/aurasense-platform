import { z } from 'zod';
import { AgentIntentSchema } from './AgentIntent.schema';
export const AgentRecommendationSchema = z.object({
  id: z.string(),
  intent: AgentIntentSchema,
  confidence: z.number(),
  rationale: z.string().optional(),
  issuedAt: z.string(),
});
