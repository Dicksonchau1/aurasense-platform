import crypto from 'crypto';

export function computeChainHash(payload: object, prevChainHash: string): string {
  const data = JSON.stringify(payload) + prevChainHash;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyChainHash(payload: object, prevChainHash: string, chainHash: string): boolean {
  return computeChainHash(payload, prevChainHash) === chainHash;
}
