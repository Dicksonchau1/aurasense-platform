import { NextResponse } from "next/server";
// TODO: VERIFY import path — your project may use @/lib/supabase/server or @/lib/supabase/admin
import { createClient } from "@/lib/supabase/server";
import type { FleetItem } from "@/lib/types/atlas";

export async function GET() {
  const supabase = await createClient();

  // TODO: VERIFY table name — `assets` may be `devices`, `fleet_assets`, or `drones` in your schema
  // TODO: VERIFY column names — battery_pct may be `battery` or `power_pct`
  const { data, error } = await supabase
    .from("assets")
    .select("id, name, class, status, battery_pct, last_seen_at, location")
    .order("last_seen_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: VERIFY shape conversion — adjust if your column names differ
  const fleet: FleetItem[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name ?? row.id),
    class: (row.class as FleetItem["class"]) ?? "drone",
    status: (row.status as FleetItem["status"]) ?? "offline",
    battery_pct: Number(row.battery_pct ?? 0),
    last_seen_at: String(row.last_seen_at ?? new Date().toISOString()),
    location: row.location as FleetItem["location"] | undefined,
  }));

  return NextResponse.json({ data: fleet });
}