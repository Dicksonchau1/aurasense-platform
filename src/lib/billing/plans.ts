// STUB - billing plans/quotas. Wire to real Stripe products + Section H pricing.
// Created during recovery on 2026-05-26.

export type PlanKey = 'pilot_starter' | 'pilot_team' | 'starter' | 'team' | 'enterprise';

export interface QuotaSpec {
  flightsPerMonth: number;
  overageRateHkd: number;
  carryover: boolean;
}

export const QUOTAS: Record<PlanKey, QuotaSpec> = {
  pilot_starter: { flightsPerMonth: 15,  overageRateHkd: 12, carryover: false },
  pilot_team:    { flightsPerMonth: 30,  overageRateHkd: 10, carryover: false },
  starter:       { flightsPerMonth: 30,  overageRateHkd: 10, carryover: false },
  team:          { flightsPerMonth: 100, overageRateHkd: 8,  carryover: true  },
  enterprise:    { flightsPerMonth: 999, overageRateHkd: 11, carryover: true  },
};

export default { QUOTAS };