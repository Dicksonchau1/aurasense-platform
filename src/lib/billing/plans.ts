// STUB - billing plans/quotas. Wire to real Stripe products + Section H pricing.
export type PlanKey = 'pilot_starter' | 'pilot_team' | 'starter' | 'team' | 'enterprise';

export interface QuotaSpec {
  // Daily usage caps (used by telemetry route)
  frames_per_day: number;   // -1 = unlimited
  bytes_per_day: number;    // -1 = unlimited
  // Monthly flight budget (used by Section H)
  flights_per_month: number;
  overage_rate_hkd: number;
  carryover: boolean;
}

export const QUOTAS: Record<PlanKey, QuotaSpec> = {
  pilot_starter: { frames_per_day: 50_000,  bytes_per_day: 500_000_000,    flights_per_month: 15,  overage_rate_hkd: 12, carryover: false },
  pilot_team:    { frames_per_day: 120_000, bytes_per_day: 1_200_000_000,  flights_per_month: 30,  overage_rate_hkd: 10, carryover: false },
  starter:       { frames_per_day: 120_000, bytes_per_day: 1_200_000_000,  flights_per_month: 30,  overage_rate_hkd: 10, carryover: false },
  team:          { frames_per_day: 400_000, bytes_per_day: 4_000_000_000,  flights_per_month: 100, overage_rate_hkd: 8,  carryover: true  },
  enterprise:    { frames_per_day: -1,      bytes_per_day: -1,              flights_per_month: 999, overage_rate_hkd: 11, carryover: true  },
};

export default { QUOTAS };