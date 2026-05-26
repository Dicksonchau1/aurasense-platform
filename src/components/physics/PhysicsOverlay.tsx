"use client";

import { useEffect, useState } from "react";
import { AIRFRAMES } from "@/lib/physics/airframes";
import { deriveDisplay, type PhysicsDisplay } from "@/lib/physics/derive";
import { ISA_SEA_LEVEL, type DroneState, type Environment } from "@/lib/physics/types";

interface SnapshotDrone {
  id: string;
  name: string | null;
  model: string | null;
  status: string | null;
  battery_pct: number | null;
  airframe_id: string | null;
}

interface SnapshotWeather {
  temperature_c: number | null;
  wind_speed_ms: number | null;
  wind_dir_deg: number | null;
  warnings: string[] | null;
}

interface SnapshotEnvelope {
  data: { drones?: SnapshotDrone[]; weather?: SnapshotWeather | null };
}

function makeState(socPct: number | null): DroneState {
  return {
    t: 0,
    position: [0, 0, -50],
    velocity: [3, 0, 0],
    attitude: [1, 0, 0, 0],
    angularVelocity: [0, 0, 0],
    batterySoc: (socPct ?? 80) / 100,
    batteryVoltage: 25.2,
  };
}

function envFromWeather(w: SnapshotWeather | null | undefined): Environment {
  if (!w) return ISA_SEA_LEVEL;
  const speed = w.wind_speed_ms ?? 0;
  const dirRad = ((w.wind_dir_deg ?? 0) * Math.PI) / 180;
  const wind: [number, number, number] = [-speed * Math.cos(dirRad), -speed * Math.sin(dirRad), 0];
  return { gravity: 9.80665, airDensity: 1.225, wind, temperatureC: w.temperature_c ?? 15 };
}

function resolveAirframeId(d: SnapshotDrone): string {
  if (d.airframe_id && AIRFRAMES[d.airframe_id]) return d.airframe_id;
  const model = (d.model ?? "").toLowerCase();
  if (model.includes("mavic")) return "dji-mavic-3-enterprise";
  if (model.includes("m30") || model.includes("matrice 30")) return "dji-matrice-30t";
  if (model.includes("m350") || model.includes("matrice 350")) return "dji-matrice-350-rtk";
  if (model.includes("hex")) return "generic-hex-3kg";
  return "dji-matrice-30t";
}

function Bar(props: { value: number; max?: number; color?: string }) {
  const max = props.max ?? 100;
  const color = props.color ?? "#22d3ee";
  const pct = Math.min(100, Math.max(0, (props.value / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, transition: "width 200ms" }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.8)", minWidth: 44, textAlign: "right" }}>{props.value.toFixed(0)}%</span>
    </div>
  );
}

function DronePanel(props: { drone: SnapshotDrone; display: PhysicsDisplay }) {
  const d = props.drone;
  const x = props.display;
  const lbl: React.CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 };
  const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 };
  const motorColor = (t: number) => t > 85 ? "#ef4444" : t > 70 ? "#f59e0b" : "#34d399";
  const wearColor = (w: number) => w < 0.85 ? "#ef4444" : w < 0.92 ? "#f59e0b" : "#34d399";
  return (
    <div style={{ padding: 14, marginBottom: 10, borderRadius: 8, border: "1px solid rgba(34,211,238,0.25)", background: "rgba(6,12,24,0.85)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: "#22d3ee", fontSize: 13 }}>{d.name ?? d.id.slice(0, 8)}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{d.model ?? ""}</span>
      </div>
      <div style={row}>
        <div style={lbl}>Throttle (hover {x.hoverThrottlePct.toFixed(0)}%)</div>
        <Bar value={x.currentThrottlePct} color={x.currentThrottlePct > 85 ? "#ef4444" : "#22d3ee"} />
      </div>
      <div style={row}>
        <div style={lbl}>Battery ({x.enduranceMin.toFixed(1)} min remaining)</div>
        <Bar value={x.batterySocPct} color={x.batterySocPct < 25 ? "#ef4444" : x.batterySocPct < 50 ? "#f59e0b" : "#34d399"} />
      </div>
      <div style={row}>
        <div style={lbl}>Motor temps</div>
        <div style={{ display: "flex", gap: 6, fontFamily: "monospace", fontSize: 11, flexWrap: "wrap" }}>
          {x.motorTempsC.map((t, i) => (
            <span key={i} style={{ color: motorColor(t), minWidth: 42, textAlign: "center", padding: "2px 4px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3 }}>M{i + 1} {t.toFixed(0)}C</span>
          ))}
        </div>
      </div>
      <div style={row}>
        <div style={lbl}>Motor wear</div>
        <div style={{ display: "flex", gap: 6, fontFamily: "monospace", fontSize: 11 }}>
          {x.motorWear.map((w, i) => (
            <span key={i} style={{ color: wearColor(w), minWidth: 38, textAlign: "center" }}>{(w * 100).toFixed(0)}%</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, marginTop: 4 }}>
        <span>T/W {x.twr.toFixed(2)}</span>
        <span>WindRel {x.windRelMs.toFixed(1)} m/s</span>
        <span>WindComp +{x.windCorrectionM.toFixed(1)} m</span>
      </div>
      {x.warnings.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(239,68,68,0.3)" }}>
          {x.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 11, color: "#fca5a5", marginBottom: 2 }}>! {w}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhysicsOverlay() {
  const [snap, setSnap] = useState<SnapshotEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/atlas/nepa/world-model/snapshot", { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();
        if (alive) { setSnap(j); setError(null); }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "fetch failed");
      }
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const drones = snap?.data?.drones ?? [];
  const weather = snap?.data?.weather ?? null;
  const env = envFromWeather(weather);

  return (
    <div style={{ width: "100%", maxHeight: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(6,12,24,0.9)", border: "1px solid rgba(34,211,238,0.3)" }}>
        <div style={{ fontSize: 10, color: "rgba(34,211,238,0.8)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Physics Overlay</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
          <span>Wind {weather?.wind_speed_ms?.toFixed(1) ?? "--"} m/s @ {weather?.wind_dir_deg?.toFixed(0) ?? "--"} deg</span>
          <span>{weather?.temperature_c?.toFixed(0) ?? "--"}C</span>
        </div>
        {error && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>! {error}</div>}
      </div>
      {drones.length === 0 ? (
        <div style={{ padding: 16, borderRadius: 8, background: "rgba(6,12,24,0.85)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" }}>
          No drones in snapshot.<br />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local</span>
        </div>
      ) : (
        drones.map((d) => {
          const airframeId = resolveAirframeId(d);
          const spec = AIRFRAMES[airframeId];
          const state = makeState(d.battery_pct);
          const hover = (spec.massKg * 9.80665) / (spec.maxThrustPerMotorN * spec.motorCount);
          const throttle = Array(spec.motorCount).fill(Math.min(0.95, hover * 1.15));
          const display = deriveDisplay(spec, state, env, throttle);
          return <DronePanel key={d.id} drone={d} display={display} />;
        })
      )}
    </div>
  );
}