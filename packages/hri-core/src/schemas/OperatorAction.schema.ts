import { z } from 'zod';
export const OperatorActionSchema = z.object({
  actionId: z.string(),
  type: z.string(),
  payload: z.any().optional(),
  acknowledged: z.boolean(),
  timestamp: z.string(),
});
