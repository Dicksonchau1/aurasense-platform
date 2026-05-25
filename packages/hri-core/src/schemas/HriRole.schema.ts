import { z } from 'zod';
export const HriRoleSchema = z.enum(['operator', 'observer', 'agent']);
