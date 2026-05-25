import { z } from 'zod';
export const PerceptionSummarySchema = z.object({
  summary: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string(),
});
