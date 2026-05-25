import { z } from 'zod';
export const HriTimelineEventSchema = z.object({
  eventId: z.string(),
  type: z.string(),
  payload: z.any().optional(),
  timestamp: z.string(),
});
