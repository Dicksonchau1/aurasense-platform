import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("drones")
      .select("id,name,serial_number,status,last_lat,last_lng,last_seen_at")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message, items: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: (data ?? []).map((row) => ({
        assetId: row.id,
        assetType: "drone",
        displayName: row.name,
        serialNumber: row.serial_number,
        status: row.status ?? "available",
        lastKnownPosition:
          row.last_lat != null && row.last_lng != null
            ? {
                lat: row.last_lat,
                lng: row.last_lng,
                timestamp: row.last_seen_at ?? undefined,
              }
            : undefined,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", items: [] },
      { status: 500 }
    );
  }
}
