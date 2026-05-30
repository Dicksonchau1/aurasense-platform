// Auth utilities
// Created during recovery on 2026-05-30.

export interface AuthContext {
  userId: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

export function getAuthContext(): AuthContext | null {
  // Stub implementation - integrate with NextAuth or your auth provider
  return null;
}

export function requireAuth(): AuthContext {
  const ctx = getAuthContext();
  if (!ctx) {
    throw new Error('Unauthorized');
  }
  return ctx;
}
