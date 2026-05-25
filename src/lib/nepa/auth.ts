// ============================================================
// STUB - returns dev-user/operator. Replace with real session check.
// Created during emergency recovery on 2026-05-26.
// ============================================================
import type { NextRequest } from 'next/server';
export type AuthContext = { userId: string; role: string };
export async function requireAuth(_req: NextRequest): Promise<AuthContext> {
  return { userId: 'dev-user', role: 'operator' };
}
export default { requireAuth };