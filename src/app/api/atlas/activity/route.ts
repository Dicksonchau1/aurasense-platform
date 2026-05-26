import { NextResponse } from "next/server";
// TODO: VERIFY import path
import { createClient } from "@/lib/supabase/server";
import type { ActivityItem } from "@/lib/types/atlas";

export async function GET() {
  const supabase = await createClient();

  // TODO: VERIFY table name — may be `audit_chain`, `audit_log`, or `events` in your schema
  // TODO: VERIFY column names — `actor` may be `user_id` or `operator_id`
  const { data, error } = await supabase
    .from("audit_chain")
    .select("id, actor, action, target, ts, audit_hash")
    .order("ts", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const activity: ActivityItem[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    actor: String(row.actor ?? "system"),
    action: String(row.action ?? "unknown"),
    target: row.target ? String(row.target) : undefined,
    ts: String(row.ts ?? new Date().toISOString()),
    audit_hash: row.audit_hash ? String(row.audit_hash) : undefined,
  }));

  return NextResponse.json({ data: activity });
}