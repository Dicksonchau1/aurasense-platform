import { NextResponse } from 'next/server'
import { getAllAssets, updateAsset, revokeAsset } from '@/lib/atlas/registry-store'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const json = await req.json()
  try {
    updateAsset(id, json)
    const asset = getAllAssets().find(a => a.id === id)
    // TODO: appendAudit({pipeline:'effector_registry_update',...})
    return NextResponse.json({ ok: true, asset })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    revokeAsset(id)
    // TODO: appendAudit({pipeline:'effector_registry_revoke',...})
    return NextResponse.json({ ok: true, id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 })
  }
}
