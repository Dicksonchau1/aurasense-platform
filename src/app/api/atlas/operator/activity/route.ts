import { NextResponse } from 'next/server'
import { envelope } from '@/lib/nepa'
import { getAllTracks, getAuthorityLog } from '@/lib/atlas/threat-store'
import { getAllAssets } from '@/lib/atlas/registry-store'
import { getAllMissions, getCommandLog } from '@/lib/atlas/mission-store'
import type { OperatorActivity } from '@/types/operator'

export async function GET(req: Request) {
  const t = Date.now()
  const activities: OperatorActivity[] = [
    ...getAuthorityLog().slice(0,5).map(tok => ({
      id: tok.audit_id, type:'threat_engage' as const,
      label: `Engagement authority issued · ${tok.track_id}`,
      detail: `jurisdiction: ${tok.sovereignty_fence}`,
      ts: tok.issued_at,
    })),
    ...getAllMissions().filter(m => m.state !== 'draft').slice(0,5).map(m => ({
      id: m.id, type:'mission' as const,
      label: `Mission ${m.state} · ${m.name}`,
      detail: `asset: ${m.asset_label}`,
      ts: m.launch_at ?? m.created_at,
    })),
    ...getAllAssets().slice(0,5).map(a => ({
      id: a.id, type:'registry_enroll' as const,
      label: `Asset enrolled · ${a.oem} ${a.model}`,
      detail: `class: ${a.capability_class}`,
      ts: a.registered_at,
    })),
    ...getCommandLog().slice(0,5).map(cmd => ({
      id: cmd.audit_id, type:'mode_change' as const,
      label: `MAVLink ${cmd.command_name} · mission ${cmd.mission_id}`,
      detail: `wire: ${cmd.frame.slice(0,20)}…`,
      ts: cmd.sent_at,
    })),
  ]
  const sorted = activities.sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0,20)
  return NextResponse.json(envelope({ activities: sorted }, t))
}