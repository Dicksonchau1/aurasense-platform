import { createHash } from 'crypto';

/** Wraps payload data with an envelope (timestamp + meta). */
export function envelope<T>(data: T, ts?: number): { data: T; ts: number; ok: true } {
  return { data, ts: ts ?? Date.now(), ok: true };
}

/**
 * jitter — overloaded:
 *   jitter(min, max)        => returns random number in [min, max]
 *   jitter(value, amount?)  => returns value (legacy passthrough)
 */
export function jitter(a: number, b?: number): number;
export function jitter<T>(value: T, _amount?: number): T;
export function jitter(a: any, b?: any): any {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + Math.random() * (b - a);
  }
  return a;
}

/** SHA-256 hex digest of a string or object (object is JSON.stringify'd). */
export function sha256(input: string | object): string {
  const data = typeof input === 'string' ? input : JSON.stringify(input);
  return createHash('sha256').update(data).digest('hex');
}

export default { envelope, jitter, sha256 };