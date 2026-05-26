import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAllTracks, evaluateEngagementPolicy, issueEngagementAuthority } from '@/lib/atlas/threat-store'
import { mintEdgeToken } from '@/lib/hmac'
import { appendAudit } from '@/lib/audit-chain'
import { envelope } from '@/lib/nepa'

const bodySchema = z.object({
  track_id: z.string(),
  operator_id: z.string(),
  sovereignty_fence: z.string()
})

export async function POST(req: Request) {
  const json = await req.json()
  const result = bodySchema.safeParse(json)
  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'validation_error', issues: result.error.flatten() }, { status: 400 })
  }
  const { track_id, operator_id, sovereignty_fence } = result.data
  const track = getAllTracks().find(t => t.id === track_id)
  if (!track) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
  const policy = evaluateEngagementPolicy(track, { jurisdiction: sovereignty_fence, region_code: track.sovereignty_fence.region_code, classification: track.sovereignty_fence.classification, valid_until: track.sovereignty_fence.valid_until })
  if (policy.verdict !== 'approved') {
    return NextResponse.json({ ok: false, rules_failed: policy.rules_failed }, { status: 403 })
  }
  const token = mintEdgeToken({ userId: operator_id, plan: 'enterprise', ttlSeconds: 120 })
  const audit_row = await appendAudit({ pipeline: 'engagement_authority', source: track.domain, region: track.sovereignty_fence.region_code, detections: [{ track_id, classification: track.classification }], latency_ms: 0 })
  const authority_token_record = issueEngagementAuthority(track_id, operator_id, track.sovereignty_fence, token.token, audit_row.id)
  return NextResponse.json(envelope({ ok: true, track_id, engagement_policy: { ...policy, engagement_authority_token: token.token, token_exp: token.exp, audit_id: audit_row.id }, authority_token_record }, Date.now()))
}
