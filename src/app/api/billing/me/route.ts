import { NextResponse } from 'next/server';
import { getUserPlan, getTodayUsage } from '@/lib/billing/quota';

export async function GET() {
  const userId = 'dev-user';
  const { plan, quota } = await getUserPlan(userId);
  const today = await getTodayUsage(userId);
  return NextResponse.json({
    user_id: userId,
    plan,
    quota,
    today,
  });
}