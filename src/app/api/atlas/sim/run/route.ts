import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runSim, type SimRunRequest } from "@/lib/sim/runner";
import { physicsBundleHash } from "@/lib/physics/bundle";
import { createServerSupabase } from "@/lib/supabase/server";
import { sha256 } from "@/lib/nepa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RunRequestBody {
  airframe_id: string;
  duration_s?: number;
  dt?: number;
  flight_plan_id?: string;
  drone_id?: string;
  weather_sample_id?: string;
  control_bias?: number;
  wind_ms?: number;
  wind_dir_deg?: number;
}

async function emitAuditEvent(sb: ReturnType<typeof createServerSupabase>, payload: Record<string, unknown>) {
  // Best-effort audit emit. The full audit chain has prev_event_hash + Merkle batching
  // handled by your background worker; we insert the raw event here.
  const tenantId = process.env.AUDIT_TENANT_ID ?? "atlas-default";
  const sessionId = "sim-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const traceId = "trace-" + Math.random().toString(36).slice(2, 10);
  const inputDigest = sha256(JSON.stringify(payload));
  const eventHash = sha256(inputDigest + sessionId);
  try {
    const { data, error } = await sb.from("audit_events").insert({
      id: randomUUID(),
      schema_version: "v1",
      tenant_id: tenantId,
      product: "atlas",
      kind: "sim.run.completed",
      session_id: sessionId,
      trace_id: traceId,
      actor_type: "service",
      model_bundle_hash: physicsBundleHash(),
      input_digest: inputDigest,
      data_rights: "tenant_local",
      verdict: { ok: true },
      edge_ts: new Date().toISOString(),
      sequence_no: Date.now(),
      event_hash: eventHash,
      raw_event: payload,
      cbor_bytes: Buffer.from(JSON.stringify(payload)).toString("base64"),
      signature: "unsigned",
      public_key_id: null,
      prev_event_hash: null,
      ingest_status: "verified",
    }).select("id").single();
    if (error) { console.error("[sim/run] audit insert failed:", error.message, error.details, error.hint); return { ok: false, error: error.message }; }
    return { ok: true, id: (data as { id: string }).id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "audit emit failed" };
  }
}

export async function POST(req: Request) {
  let body: RunRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.airframe_id) {
    return NextResponse.json({ ok: false, error: "airframe_id required" }, { status: 400 });
  }

  const simReq: SimRunRequest = {
    airframeId: body.airframe_id,
    durationS: body.duration_s ?? 30,
    dt: body.dt,
    controlBias: body.control_bias,
  };
  if (body.wind_ms != null) {
    const dirRad = ((body.wind_dir_deg ?? 0) * Math.PI) / 180;
    simReq.environment = {
      wind: [-body.wind_ms * Math.cos(dirRad), -body.wind_ms * Math.sin(dirRad), 0],
    };
  }

  let result;
  try {
    result = runSim(simReq);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "sim failed" }, { status: 500 });
  }

  const sb = createServerSupabase();
  const bundleHash = physicsBundleHash();

  // Emit audit event (best-effort, doesn't block on failure)
  const auditPayload = {
    airframe_id: result.airframeId,
    duration_s: result.durationS,
    dt: result.dt,
    steps: result.steps,
    energy_total_j: result.energyTotalJ,
    max_altitude_m: result.maxAltitudeM,
    max_speed_ms: result.maxSpeedMs,
    final_state: result.finalState,
    warnings: result.warnings,
    physics_bundle_hash: bundleHash,
    drone_id: body.drone_id ?? null,
    flight_plan_id: body.flight_plan_id ?? null,
    weather_sample_id: body.weather_sample_id ?? null,
  };
  const audit = await emitAuditEvent(sb, auditPayload);

  // Insert sim_runs row
  let simRunId: string | null = null;
  try {
    const { data, error } = await sb.from("sim_runs").insert({
      flight_plan_id: body.flight_plan_id ?? null,
      drone_id: body.drone_id ?? null,
      airframe_id: result.airframeId,
      physics_bundle_hash: bundleHash,
      weather_sample_id: body.weather_sample_id ?? null,
      started_at: result.startedAt,
      completed_at: result.completedAt,
      outcome: result.warnings.length === 0 ? "ok" : result.warnings.join(","),
      alerts_count: result.warnings.length,
      steps_count: result.steps,
      energy_total_j: result.energyTotalJ,
      final_state: result.finalState,
      audit_event_id: audit.ok ? (audit as { ok: true; id: string }).id : null,
      metadata: { max_altitude_m: result.maxAltitudeM, max_speed_ms: result.maxSpeedMs },
    }).select("id").single();
    if (!error && data) simRunId = (data as { id: string }).id;
    else if (error) console.warn("[sim/run] sim_runs insert failed:", error.message);
  } catch (err: any) {
    console.warn("[sim/run] sim_runs insert error:", err?.message);
  }

  return NextResponse.json({
    ok: true,
    sim_run_id: simRunId,
    audit_event_id: audit.ok ? (audit as { ok: true; id: string }).id : null,
    physics_bundle_hash: bundleHash,
    result,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    physics_bundle_hash: physicsBundleHash(),
    hint: "POST /api/atlas/sim/run with { airframe_id, duration_s?, wind_ms?, wind_dir_deg?, control_bias?, drone_id?, flight_plan_id?, weather_sample_id? }",
  });
}