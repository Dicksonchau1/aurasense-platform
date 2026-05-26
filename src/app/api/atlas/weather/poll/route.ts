import { NextResponse } from "next/server";
import { fetchHkoSample } from "@/lib/sources/hko";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_TOKEN = process.env.WEATHER_POLL_TOKEN ?? "";

async function persistSample(sample: Awaited<ReturnType<typeof fetchHkoSample>>) {
  const sb = createServerSupabase();
  const { data, error } = await sb
    .from("weather_samples")
    .insert({
      station: sample.station,
      observed_at: sample.observed_at,
      temperature_c: sample.temperature_c,
      humidity_pct: sample.humidity_pct,
      uv_index: sample.uv_index,
      rainfall_mm_1h: sample.rainfall_mm_1h,
      wind_speed_ms: sample.wind_speed_ms,
      wind_dir_deg: sample.wind_dir_deg,
      wind_gust_ms: sample.wind_gust_ms,
      pressure_hpa: sample.pressure_hpa,
      warnings: sample.warnings,
      raw: sample.raw,
      source: sample.source,
    })
    .select()
    .single();
  if (error) {
    // Unique violation on (station, observed_at) is expected when polled twice within HKO's 10-min update cadence
    if ((error as { code?: string }).code === "23505") {
      return { skipped: true, reason: "duplicate observed_at" };
    }
    throw error;
  }
  return { inserted: true, id: (data as { id: string }).id };
}

async function handle(req: Request) {
  if (POLL_TOKEN) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? req.headers.get("x-poll-token");
    if (token !== POLL_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const sample = await fetchHkoSample();
    const result = await persistSample(sample);
    return NextResponse.json({
      ok: true,
      sample: {
        station: sample.station,
        observed_at: sample.observed_at,
        temperature_c: sample.temperature_c,
        wind_speed_ms: sample.wind_speed_ms,
        wind_dir_deg: sample.wind_dir_deg,
        warnings: sample.warnings,
      },
      persist: result,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "failed" }, { status: 500 });
  }
}

export async function GET(req: Request) { return handle(req); }
export async function POST(req: Request) { return handle(req); }