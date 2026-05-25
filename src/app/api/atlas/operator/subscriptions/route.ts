import { NextResponse } from 'next/server'
import { envelope } from '@/lib/nepa'
import type { SubstrateSubscription } from '@/types/operator'
import { DOMAINS } from '@/components/civilisation-domain-switcher'

export async function GET(req: Request) {
  const t = Date.now()
  // 3 active, 6 provisioning
  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  const activeSet = new Set(['Defence', 'Port Autonomy', 'Urban Traffic'])
  const subscriptions: SubstrateSubscription[] = DOMAINS.map((d, i) => {
    let provisioned_at = new Date(now)
    if (d.domain === 'Defence') provisioned_at.setDate(now.getDate() - 30)
    else if (activeSet.has(d.domain)) provisioned_at.setDate(now.getDate() - 7)
    let expires_at = new Date(provisioned_at); expires_at.setFullYear(provisioned_at.getFullYear() + 1)
    return {
      domain: d.domain,
      substrate_instance: d.substrate_instance,
      jurisdiction: d.jurisdiction,
      status: activeSet.has(d.domain) ? 'active' : 'provisioning',
      provisioned_at: iso(provisioned_at),
      expires_at: activeSet.has(d.domain) ? iso(expires_at) : null,
    }
  })
  return NextResponse.json(envelope({ subscriptions }, t))
}