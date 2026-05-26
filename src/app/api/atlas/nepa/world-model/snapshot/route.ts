import { NextResponse } from "next/server";
import { envelope, jitter } from "@/lib/nepa";
import { inferFrameSafe } from "@/lib/runtime";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const predErrHistory: number[] = [];

interface BuildingDto {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
  risk_score: number | null;
  mbis_id: string | null;
  gltf_url: string | null;
  obj_url: string | null;
  source: string | null;
}

interface DroneDto {
  id: string;
  name: string | null;
  model: string | null;
  status: string | null;
  battery_pct: number | null;
  home_lat: number | null;
  home_lng: number | null;
  airframe_id: string | null;
  last_seen_at: string | null;
}

interface WeatherDto {
  station: string;
  observed_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  wind_speed_ms: number | null;
  wind_dir_deg: number | null;
  uv_index: number | null;
  warnings: string[] | null;
}

async function loadBuildings(): Promise<BuildingDto[]> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("buildings")
      .select("id,name,lat,lng,height_m,floor_count,risk_score,mbis_id,gltf_url,obj_url,source")
      .limit(500);
    if (error) {
      console.warn("[snapshot] buildings query failed:", error.message);
      return [];
    }
    return (data ?? []) as BuildingDto[];
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for buildings:", err?.message);
    return [];
  }
}

async function loadDrones(): Promise<DroneDto[]> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("drones")
      .select("id,name,model,status,battery_pct,home_lat,home_lng,airframe_id,last_seen_at")
      .limit(100);
    if (error) {
      console.warn("[snapshot] drones query failed:", error.message);
      return [];
    }
    return (data ?? []) as DroneDto[];
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for drones:", err?.message);
    return [];
  }
}

async function loadLatestWeather(): Promise<WeatherDto | null> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("weather_samples")
      .select("station,observed_at,temperature_c,humidity_pct,wind_speed_ms,wind_dir_deg,uv_index,warnings")
      .order("observed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("[snapshot] weather query failed:", error.message);
      return null;
    }
    return data as WeatherDto | null;
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for weather:", err?.message);
    return null;
  }
}

export async function GET() {
  const t = Date.now();

  // Existing inference frame (sim or live via runtime.ts)
  const result = await inferFrameSafe(Buffer.alloc(0), { source: "world-model-snapshot", region: "FULL" });
  const wm = result.world_model;

  // 12x12 occupancy grid (preserved)
  const grid: number[][] = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => {
      const base = jitter(0.02, 0.08);
      if (wm.anomaly_flag && r >= 4 && r <= 7 && c >= 4 && c <= 7) {
        return Math.min(1, base + jitter(0.4, 0.7));
      }
      return base;
    })
  );

  // Prediction error rolling buffer (preserved)
  predErrHistory.push(wm.prediction_error);
  if (predErrHistory.length > 60) predErrHistory.shift();

  // Latent projection (preserved)
  const latentProjection = 
cd C:\Users\milky\Downloads\atlas-api-integration-pass\atlas-frontend
@'
import { NextResponse } from "next/server";
import { envelope, jitter } from "@/lib/nepa";
import { inferFrameSafe } from "@/lib/runtime";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const predErrHistory: number[] = [];

interface BuildingDto {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
  risk_score: number | null;
  mbis_id: string | null;
  gltf_url: string | null;
  obj_url: string | null;
  source: string | null;
}

interface DroneDto {
  id: string;
  name: string | null;
  model: string | null;
  status: string | null;
  battery_pct: number | null;
  home_lat: number | null;
  home_lng: number | null;
  airframe_id: string | null;
  last_seen_at: string | null;
}

interface WeatherDto {
  station: string;
  observed_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  wind_speed_ms: number | null;
  wind_dir_deg: number | null;
  uv_index: number | null;
  warnings: string[] | null;
}

async function loadBuildings(): Promise<BuildingDto[]> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("buildings")
      .select("id,name,lat,lng,height_m,floor_count,risk_score,mbis_id,gltf_url,obj_url,source")
      .limit(500);
    if (error) {
      console.warn("[snapshot] buildings query failed:", error.message);
      return [];
    }
    return (data ?? []) as BuildingDto[];
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for buildings:", err?.message);
    return [];
  }
}

async function loadDrones(): Promise<DroneDto[]> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("drones")
      .select("id,name,model,status,battery_pct,home_lat,home_lng,airframe_id,last_seen_at")
      .limit(100);
    if (error) {
      console.warn("[snapshot] drones query failed:", error.message);
      return [];
    }
    return (data ?? []) as DroneDto[];
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for drones:", err?.message);
    return [];
  }
}

async function loadLatestWeather(): Promise<WeatherDto | null> {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("weather_samples")
      .select("station,observed_at,temperature_c,humidity_pct,wind_speed_ms,wind_dir_deg,uv_index,warnings")
      .order("observed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("[snapshot] weather query failed:", error.message);
      return null;
    }
    return data as WeatherDto | null;
  } catch (err: any) {
    console.warn("[snapshot] supabase unavailable for weather:", err?.message);
    return null;
  }
}

export async function GET() {
  const t = Date.now();

  const result = await inferFrameSafe(Buffer.alloc(0), { source: "world-model-snapshot", region: "FULL" });
  const wm = result.world_model;

  const grid: number[][] = Array.from({ length: 12 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => {
      const base = jitter(0.02, 0.08);
      if (wm.anomaly_flag && r >= 4 && r <= 7 && c >= 4 && c <= 7) {
        return Math.min(1, base + jitter(0.4, 0.7));
      }
      return base;
    })
  );

  predErrHistory.push(wm.prediction_error);
  if (predErrHistory.length > 60) predErrHistory.shift();

  const latentProjection = [
    { x: jitter(-0.8, -0.3), y: jitter(-0.4, 0.1), label: "patrol_pattern" },
    { x: jitter(0.2, 0.7), y: jitter(-0.6, -0.1), label: "hovering" },
    { x: jitter(-0.5, 0.0), y: jitter(0.3, 0.8), label: "approach_vector" },
    { x: jitter(0.5, 0.9), y: jitter(0.4, 0.9), label: "swarm_coord" },
    { x: jitter(-0.9, -0.5), y: jitter(-0.9, -0.5), label: "ground_loiter" },
    { x: jitter(0.1, 0.4), y: jitter(-0.9, -0.4), label: "fast_transit" },
    { x: jitter(-0.3, 0.2), y: jitter(0.0, 0.4), label: "formation_hold" },
    { x: jitter(0.6, 1.0), y: jitter(-0.2, 0.3), label: "anomaly_cluster" },
  ];

  const [buildings, drones, weather] = await Promise.all([
    loadBuildings(),
    loadDrones(),
    loadLatestWeather(),
  ]);

  return NextResponse.json(envelope({
    ...wm,
    occupancy_grid: grid,
    pred_err_history: [...predErrHistory],
    latent_projection: latentProjection,
    buildings,
    drones,
    weather,
    runtime: result.runtime,
    latency_ms: result.latency_ms,
    ts: t,
  }, t));
}
