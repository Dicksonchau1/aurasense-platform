import { z } from 'zod';
export const InterventionRequestSchema = z.object({
  requestId: z.string(),
  reason: z.string(),
  requestedAt: z.string(),
  resolved: z.boolean(),
  resolvedAt: z.string().optional(),
});
