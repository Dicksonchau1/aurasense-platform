import { z } from 'zod';
export const HriSessionStatusSchema = z.enum(['idle', 'active', 'awaiting_human', 'completed', 'failed']);
