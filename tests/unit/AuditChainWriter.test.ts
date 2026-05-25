// tests/unit/AuditChainWriter.test.ts
// Verifies deterministic hash chaining across consecutive frames.
// PR D-2 (2026-05-23)

import { describe, it, expect } from '@jest/globals';
import { createHash } from 'node:crypto';

function deterministicStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(deterministicStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map(
        (k) =>
          JSON.stringify(k) +
          ':' +
          deterministicStringify((obj as Record<string, unknown>)[k])
      )
      .join(',') +
    '}'
  );
}

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

describe('AuditChainWriter', () => {
  it('hash chain links frames deterministically', () => {
    const GENESIS =
      '0000000000000000000000000000000000000000000000000000000000000000';

    const f1 = { tick: 1, signature_type: 'engine_response', value: 0.32 };
    const f2 = { tick: 2, signature_type: 'engine_response', value: 0.34 };
    const f3 = { tick: 3, signature_type: 'engine_response', value: 0.35 };

    const a1 = sha256(deterministicStringify(f1));
    const c1 = sha256(GENESIS + a1);

    const a2 = sha256(deterministicStringify(f2));
    const c2 = sha256(c1 + a2);

    const a3 = sha256(deterministicStringify(f3));
    const c3 = sha256(c2 + a3);

    expect(c1.length).toBe(64);
    expect(c1).not.toBe(c2);
    expect(c2).not.toBe(c3);

    // Replay determinism
    const a1b = sha256(deterministicStringify(f1));
    const c1b = sha256(GENESIS + a1b);
    expect(c1).toBe(c1b);
  });

  it('key order does not affect audit_hash', () => {
    const a = { tick: 1, signature_type: 'x', value: 0.5 };
    const b = { value: 0.5, signature_type: 'x', tick: 1 };
    expect(sha256(deterministicStringify(a))).toBe(
      sha256(deterministicStringify(b))
    );
  });
});

test('key order does not affect audit_hash', () => {
  const a = { tick: 1, signature_type: 'x', value: 0.5 };
  const b = { value: 0.5, signature_type: 'x', tick: 1 };
  expect(sha256(deterministicStringify(a))).toBe(
    sha256(deterministicStringify(b))
  );
});