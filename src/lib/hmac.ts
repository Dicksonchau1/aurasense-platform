// HMAC utility for token generation
// Created during recovery on 2026-05-30.

import { createHmac } from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || 'dev-secret-key-change-in-production';

export function mintHmacToken(payload: Record<string, any>): string {
  const canonical = JSON.stringify(payload);
  const token = createHmac('sha256', HMAC_SECRET)
    .update(canonical)
    .digest('hex');
  return token;
}

export function verifyHmacToken(payload: Record<string, any>, token: string): boolean {
  const expected = mintHmacToken(payload);
  return token === expected;
}

export function mintEdgeToken(payload: Record<string, any>): string {
  return mintHmacToken(payload);
}
