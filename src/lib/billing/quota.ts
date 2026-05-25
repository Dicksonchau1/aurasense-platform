// STUB - quota tracking. Wire to real Supabase usage rollups.
// Created during recovery on 2026-05-26.

import { QUOTAS, type PlanKey } from './plans';

export interface DailyUsageRecord {
  date: string;
  flights: number;
  postflightCompute: number;
}

export async function getTodayUsage(_userId: string): Promise<DailyUsageRecord> {
  return {
    date: new Date().toISOString().slice(0, 10),
    flights: 0,
    postflightCompute: 0,
  };
}

export async function getUserPlan(_userId: string): Promise<{ plan: PlanKey; quota: typeof QUOTAS[PlanKey] }> {
  const plan: PlanKey = 'starter';
  return { plan, quota: QUOTAS[plan] };
}

export default { getTodayUsage, getUserPlan };