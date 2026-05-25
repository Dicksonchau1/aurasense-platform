import { NextResponse } from 'next/server'
import { getTodayUsage, getUserPlan } from '@/lib/billing/quota'
import { QUOTAS } from '@/lib/billing/plans'
import { envelope, jitter } from '@/lib/nepa'
import type { LiveUsageTelemetry, DailyUsageRecord } from '@/types/operator'

export async function GET(req: Request) {
  const t = Date.now()
  // TODO: Replace with real user ID extraction
  const userId = 'demo-user-id'
  const plan = await getUserPlan(userId)
  const quota = QUOTAS[plan]
  const today = await getTodayUsage(userId)
  // Mock history_7d if no Supabase
  const history_7d: DailyUsageRecord[] = Array.from({length:7}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return {
      day: d.toISOString().slice(0,10),
      frames: Math.round(jitter(40, 180)),
      videos: Math.round(jitter(0, 8)),
      bytes: Math.round(jitter(20, 120)) * 1024 * 1024,
    }
  })
  const frame_pct_used = quota.frames_per_day === -1 ? -1 : Math.round((today.frames / quota.frames_per_day) * 100)
  const bytes_pct_used = quota.bytes_per_day === -1 ? -1 : Math.round((today.bytes / quota.bytes_per_day) * 100)
  return NextResponse.json(envelope({ today, history_7d, quota, remaining_frames: quota.frames_per_day === -1 ? -1 : quota.frames_per_day - today.frames, frame_pct_used, bytes_pct_used }, t))
}