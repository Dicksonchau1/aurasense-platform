import { NextResponse } from 'next/server'
import { z } from 'zod'
import { envelope } from '../../../../lib/nepa'
import { getAllAssets, enrollAsset } from '../../../../lib/atlas/registry-store'

const assetSchema = z.object({
  oem: z.string(),
  model: z.string(),
  capability_class: z.string(),
  source: z.string(),
  status: z.string(),
  command_protocol: z.string(),
  kinematic_envelope: z.object({
    max_speed_mps: z.number(),
    max_altitude_m: z.number().optional(),
    range_m: z.number(),
    endurance_s: z.number(),
    payload_kg: z.number().optional(),
    degrees_of_freedom: z.number().optional()
  }),
  sovereignty_fence: z.object({
    jurisdiction: z.string(),
    region_code: z.string(),
    classification: z.string(),
    valid_from: z.string(),
    valid_until: z.string(),
    engagement_rules_hash: z.string()
  }),
  battery_pct: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  ip_address: z.string().optional(),
  hardware_id: z.string().optional(),
  firmware_version: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const source = url.searchParams.get('source')
  const capability_class = url.searchParams.get('capability_class')
  let assets = getAllAssets()
  if (source) assets = assets.filter(a => a.source === source)
  if (capability_class) assets = assets.filter(a => a.capability_class === capability_class)
  return NextResponse.json(envelope({ assets, count: assets.length }, Date.now()))
}

export async function POST(req: Request) {
  const json = await req.json()
  const result = assetSchema.safeParse(json)
  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'validation_error', issues: result.error.flatten() }, { status: 400 })
  }
  const asset = enrollAsset(result.data, 'OPS-001')
  // TODO: appendAudit({pipeline:'effector_registry_enroll',...})
  return NextResponse.json(envelope(asset, Date.now()), { status: 201 })
}
