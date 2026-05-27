import { evaluatePolicyGate } from '../src/policyGate';

describe('Policy Gate', () => {
  it('allows L3+ actions by default', () => {
    const result = evaluatePolicyGate({}, {}, {}, {}, {});
    expect(result.allowed).toBe(true);
    expect(result.requiredAutonomy).toBe('L3_GUARDED');
  });
});
