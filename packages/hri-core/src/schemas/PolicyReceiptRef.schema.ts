import { z } from 'zod';
export const PolicyReceiptRefSchema = z.object({
  policyId: z.string(),
  receiptId: z.string(),
  attachedAt: z.string(),
});
