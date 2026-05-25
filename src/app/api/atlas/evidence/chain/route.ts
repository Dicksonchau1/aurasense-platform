import { NextResponse } from "next/server"
import { admin } from "@/lib/supabase/admin"

export async function GET() {
  // Fetch the latest 50 evidence chain rows (audit chain)
  const sb = admin()
  const { data, error } = await sb
    .from("nepa_audit")
    .select("id,user_id,created_at,row_hash,prev_hash,canonical_json")
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data: { rows: data } })
}
