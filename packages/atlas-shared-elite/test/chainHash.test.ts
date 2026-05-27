import { computeChainHash, verifyChainHash } from '../src/chainHash';

describe('Chain Hash', () => {
  it('computes and verifies chain hash continuity', () => {
    const payload1 = { foo: 'bar' };
    const payload2 = { foo: 'baz' };
    const prevHash = '0'.repeat(64);
    const hash1 = computeChainHash(payload1, prevHash);
    const hash2 = computeChainHash(payload2, hash1);
    expect(verifyChainHash(payload1, prevHash, hash1)).toBe(true);
    expect(verifyChainHash(payload2, hash1, hash2)).toBe(true);
    expect(verifyChainHash(payload2, prevHash, hash2)).toBe(false);
  });
});
