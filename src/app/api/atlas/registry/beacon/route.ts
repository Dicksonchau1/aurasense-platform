import { NextResponse } from 'next/server'
import { enrollBeaconAssets } from '../../../../lib/atlas/registry-store'

export async function POST(req: Request) {
  const json = await req.json()
  const { emergency, multicast_group } = json
  if (emergency) {
    const count = 3 + Math.floor(Math.random() * 4)
    const assets = enrollBeaconAssets(count)
    // TODO: appendAudit({ pipeline:'agentic_mobility_broker_enroll', ... })
    // TODO: publish('*', { ... })
    return NextResponse.json({ ok: true, enrolled: count, asset_ids: assets.map(a => a.id) })
  }
  return NextResponse.json({ ok: false, error: 'not_emergency' }, { status: 400 })
}
