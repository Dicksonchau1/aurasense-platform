import { z } from 'zod';
export const AgentIntentSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  timestamp: z.string(),
});
