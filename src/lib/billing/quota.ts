// STUB - quota tracking. Wire to real Supabase usage rollups.
import { QUOTAS, type PlanKey, type QuotaSpec } from './plans';

export interface DailyUsageRecord {
  date: string;
  frames_used: number;
  bytes_used: number;
  flights: number;
}

export async function getTodayUsage(_userId: string): Promise<DailyUsageRecord> {
  return {
    date: new Date().toISOString().slice(0, 10),
    frames_used: 0,
    bytes_used: 0,
    flights: 0,
  };
}

export async function getUserPlan(_userId: string): Promise<{ plan: PlanKey; quota: QuotaSpec }> {
  const plan: PlanKey = 'starter';
  return { plan, quota: QUOTAS[plan] };
}

export default { getTodayUsage, getUserPlan };