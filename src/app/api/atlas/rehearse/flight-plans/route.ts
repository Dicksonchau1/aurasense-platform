import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const buildingId = url.searchParams.get("building_id");
  if (!buildingId) {
    return NextResponse.json({ ok: false, error: "building_id required" }, { status: 400 });
  }
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("flight_plans")
      .select("id,name,status,waypoints,altitude_m,estimated_duration_min,actual_duration_min,started_at,completed_at,drone_id")
      .eq("building_id", buildingId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, data: [] });
    }
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "failed", data: [] });
  }
}