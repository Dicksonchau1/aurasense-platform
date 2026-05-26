"use client";

import { useState } from "react";
import PhysicsOverlay from "@/components/physics/PhysicsOverlay";

interface Building {
  id: string;
  name: string | null;
  height_m: number | null;
  risk_score: number | null;
}

interface FlightPlan {
  id: string;
  name: string;
  status: string;
  estimated_duration_min: number | null;
  altitude_m: number | null;
}

interface SimResult {
  ok: boolean;
  sim_run_id?: string;
  audit_event_id?: string | null;
  physics_bundle_hash?: string;
  result?: any;
  error?: string;
}

export default function RehearseControls({ building, plans }: { building: Building; plans: FlightPlan[] }) {
  const [airframe, setAirframe] = useState("dji-matrice-30t");
  const [duration, setDuration] = useState(30);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  const runSim = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch("/api/atlas/sim/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airframe_id: airframe,
          duration_s: duration,
          wind_ms: 5.2,
          wind_dir_deg: 220,
        }),
      });
      const j = await r.json();
      setResult(j);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message ?? "Network error" });
    } finally {
      setRunning(false);
    }
  };

  const lbl: React.CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 };
  const card: React.CSSProperties = { padding: 14, borderRadius: 8, border: "1px solid rgba(34,211,238,0.25)", background: "rgba(6,12,24,0.85)", marginBottom: 10 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "6px 8px", background: "#060f1e", border: "1px solid #1a1f26", borderRadius: 4, color: "#e0e8f2", fontSize: 12, fontFamily: "monospace" };

  return (
    <div>
      <div style={card}>
        <div style={lbl}>Sim Run</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Airframe</div>
          <select value={airframe} onChange={(e) => setAirframe(e.target.value)} style={inputStyle}>
            <option value="dji-mavic-3-enterprise">DJI Mavic 3E</option>
            <option value="dji-matrice-30t">DJI Matrice 30T</option>
            <option value="dji-matrice-350-rtk">DJI Matrice 350 RTK</option>
            <option value="generic-hex-3kg">Generic Hex 3kg</option>
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Duration (s)</div>
          <input type="number" value={duration} min={5} max={600} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)} style={inputStyle} />
        </div>
        <button onClick={runSim} disabled={running} style={{ width: "100%", padding: "8px 12px", background: running ? "#1a1f26" : "#22d3ee", color: running ? "#5ab8d0" : "#060f1e", border: "none", borderRadius: 5, fontWeight: 600, fontSize: 12, cursor: running ? "wait" : "pointer" }}>
          {running ? "Running 6DOF RK4..." : "Run Simulation"}
        </button>
        {result && (
          <div style={{ marginTop: 10, padding: 8, background: "rgba(6,15,30,0.6)", border: "1px solid " + (result.ok ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"), borderRadius: 4, fontSize: 11, fontFamily: "monospace", color: result.ok ? "#34d399" : "#fca5a5" }}>
            {result.ok ? (
              <div>
                <div>sim_run: {result.sim_run_id?.slice(0, 8)}</div>
                <div>audit: {result.audit_event_id ? result.audit_event_id.slice(0, 8) : "null"}</div>
                <div>bundle: {result.physics_bundle_hash?.slice(0, 12)}</div>
                <div>steps: {result.result?.steps}</div>
                <div>energy: {result.result?.energyTotalJ?.toFixed(0)} J</div>
                <div>maxAlt: {result.result?.maxAltitudeM?.toFixed(1)} m</div>
                <div>maxSpd: {result.result?.maxSpeedMs?.toFixed(2)} m/s</div>
                <div>warnings: {result.result?.warnings?.length ?? 0}</div>
              </div>
            ) : (
              <div>FAILED: {result.error}</div>
            )}
          </div>
        )}
      </div>

      <div style={card}>
        <div style={lbl}>Flight Plans ({plans.length})</div>
        {plans.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>No flight plans for this building yet.</div>
        ) : (
          plans.map((p) => (
            <div key={p.id} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 12, color: "#22d3ee" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                {p.status} | alt {p.altitude_m ?? "?"}m | {p.estimated_duration_min ?? "?"} min
              </div>
            </div>
          ))
        )}
      </div>

      <div style={card}>
        <div style={lbl}>Defects (Spatial Anomaly Localizer)</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {building.risk_score == null ? "No anomalies detected." : building.risk_score + " risk score - "}
          {building.risk_score != null && building.risk_score > 75 ? "CRITICAL" : building.risk_score != null && building.risk_score > 60 ? "ADVISORY" : "nominal"}
        </div>
        <div style={{ fontSize: 10, color: "rgba(91,184,208,0.6)", marginTop: 6 }}>
          V-JEPA2 dense feature maps via AuraSense_NEPA backend - real-time when backend online.
        </div>
      </div>

      <PhysicsOverlay />
    </div>
  );
}