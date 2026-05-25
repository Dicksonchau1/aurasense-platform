import { z } from 'zod';
export const TrustEnvelopeSchema = z.object({
  trustLevel: z.number(),
  rationale: z.string().optional(),
  issuedAt: z.string(),
});
