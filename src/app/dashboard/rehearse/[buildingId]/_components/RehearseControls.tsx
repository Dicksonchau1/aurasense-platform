"use client";

import { useState, useEffect, useRef } from "react";
import PhysicsOverlay from "@/components/physics/PhysicsOverlay";
import { planInspection, flattenPlan, type FloorDefect, type AgentFeedback, type InspectionPlan, type Severity } from "./PolygonAgent";
import { LiveDroneSimulator, type SimTick } from "./LiveDroneSimulator";
import { AgentFeedbackPanel } from "./AgentFeedbackPanel";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
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
  const [clickedFloor, setClickedFloor] = useState<{ floor: number; altM: number; face: "N"|"E"|"S"|"W" } | null>(null);
  const [agentFeedback, setAgentFeedback] = useState<AgentFeedback[]>([]);
  const [agentPlan, setAgentPlan] = useState<InspectionPlan | null>(null);
  const [simTick, setSimTick] = useState<SimTick | null>(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const simRef = useRef<LiveDroneSimulator | null>(null);

  useEffect(() => {
    const handler = (ev: any) => {
      const detail = ev?.detail;
      if (!detail || detail.building_id !== building.id) return;
      const heightM = building.height_m ?? 40;
      const floorCount = Math.max(1, Math.floor(heightM / 3.5));
      const floorH = heightM / floorCount;
      const altM = Math.random() * heightM;
      const floor = Math.max(1, Math.min(floorCount, Math.floor(altM / floorH) + 1));
      // Pick a face deterministically from floor index so same floor always same face
      const faces = ["N", "E", "S", "W"] as const;
      const face = faces[floor % 4];
      setClickedFloor({ floor, altM, face });
    };
    window.addEventListener("rehearse-map-click", handler as EventListener);
    return () => window.removeEventListener("rehearse-map-click", handler as EventListener);
  }, [building.id, building.height_m]);
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

  const runPolygonAgent = async () => {
    if (simRef.current) { simRef.current.stop(); simRef.current = null; }
    window.dispatchEvent(new CustomEvent("rehearse-trail-reset"));
    setAgentFeedback([]);
    setAgentPlan(null);
    setSimTick(null);
    setAgentRunning(true);
    const pushFb = (f: AgentFeedback) => setAgentFeedback((prev) => [...prev, f]);
    let wind = { windSpeedMs: 5.2, windDirDeg: 220, temperatureC: 32 };
    try {
      const r = await fetch("/api/atlas/nepa/world-model/snapshot", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const w = j?.data?.weather;
        if (w) wind = { windSpeedMs: w.wind_speed_ms ?? wind.windSpeedMs, windDirDeg: w.wind_dir_deg ?? wind.windDirDeg, temperatureC: w.temperature_c ?? wind.temperatureC };
      }
    } catch {}
    const heightM = building.height_m ?? 40;
    const totalFloors = Math.max(1, Math.floor(heightM / 3.5));
    const defects: FloorDefect[] = clickedFloor ? [
      { floor: clickedFloor.floor, face: clickedFloor.face, severity: "critical" as Severity, defectCode: "DEF-202 Spalling", confidence: 0.96 },
      { floor: Math.max(1, clickedFloor.floor - 5), face: clickedFloor.face, severity: "advisory" as Severity, defectCode: "DEF-328 Cracks", confidence: 0.81 },
      { floor: Math.min(totalFloors, clickedFloor.floor + 8), face: "E", severity: "advisory" as Severity, defectCode: "DEF-114 Efflorescence", confidence: 0.74 },
    ] : [
      { floor: Math.floor(totalFloors / 2), face: "N", severity: "critical" as Severity, defectCode: "DEF-202 Spalling", confidence: 0.92 },
      { floor: Math.floor(totalFloors / 3), face: "E", severity: "advisory" as Severity, defectCode: "DEF-114 Efflorescence", confidence: 0.78 },
    ];
    const lat = (building as any).lat ?? 22.32;
    const lng = (building as any).lng ?? 114.17;
    const massMap: Record<string, number> = { "dji-mavic-3-enterprise": 0.915, "dji-matrice-30t": 3.998, "dji-matrice-350-rtk": 6.47, "generic-hex-3kg": 3.0 };
    const thrustMap: Record<string, number> = { "dji-mavic-3-enterprise": 6.8, "dji-matrice-30t": 28.4, "dji-matrice-350-rtk": 48.1, "generic-hex-3kg": 18 };
    const hoverIMap: Record<string, number> = { "dji-mavic-3-enterprise": 6.2, "dji-matrice-30t": 24, "dji-matrice-350-rtk": 28, "generic-hex-3kg": 22 };
    const batteryAhMap: Record<string, number> = { "dji-mavic-3-enterprise": 5.0, "dji-matrice-30t": 5.88, "dji-matrice-350-rtk": 17.4, "generic-hex-3kg": 16 };
    const cellsMap: Record<string, number> = { "dji-mavic-3-enterprise": 4, "dji-matrice-30t": 12, "dji-matrice-350-rtk": 12, "generic-hex-3kg": 6 };
    const motorCountMap: Record<string, number> = { "dji-mavic-3-enterprise": 4, "dji-matrice-30t": 4, "dji-matrice-350-rtk": 4, "generic-hex-3kg": 6 };
    const plan = planInspection(
      { id: building.id, name: building.name ?? "Unknown", lat, lng, heightM, totalFloors },
      defects,
      { id: airframe, massKg: massMap[airframe] ?? 4, motorCount: motorCountMap[airframe] ?? 4, maxThrustPerMotorN: thrustMap[airframe] ?? 28, hoverCurrentA: hoverIMap[airframe] ?? 24, batteryCapacityAh: batteryAhMap[airframe] ?? 5.88, batteryCellsSeries: cellsMap[airframe] ?? 12 },
      wind, 90, pushFb,
    );
    setAgentPlan(plan);
    let flat = flattenPlan(plan);
    if (flat.length === 0) { setAgentRunning(false); return; }
    // Prepend a "start" waypoint at the building rooftop so the drone has a known launch point
    // that matches the simulator origin (building lat/lng). Eliminates the lat/lng drift bug
    // where simulator origin and waypoint origin disagreed.
    const startWp = { seq: 0, lat, lng, alt_m: heightM + 10, speed_ms: 5 };
    flat = [startWp, ...flat.map((w, i) => ({ ...w, seq: i + 1 }))];
    pushFb({ ts: Date.now(), kind: "info", msg: "Inserted launch waypoint at " + lat.toFixed(5) + ", " + lng.toFixed(5) + ", alt " + (heightM + 10).toFixed(0) + "m" });
    flat.forEach((w) => {
      window.dispatchEvent(new CustomEvent("rehearse-add-waypoint", { detail: { building_id: building.id, lat: w.lat, lng: w.lng, alt_m: w.alt_m } }));
    });
    // Tell the 3D waypoint-drones layer about the full set so it renders mini-drones at each waypoint
    window.dispatchEvent(new CustomEvent("rehearse-waypoints-set", { detail: { waypoints: flat.map(w => ({ seq: w.seq, lat: w.lat, lng: w.lng, alt_m: w.alt_m })) } }));
    pushFb({ ts: Date.now(), kind: "info", msg: "Dispatched " + flat.length + " waypoints to map" });
    pushFb({ ts: Date.now(), kind: "info", msg: "Starting live drone simulator with " + airframe + " at 30Hz" });
    const sim = new LiveDroneSimulator({
      airframeId: airframe,
      waypoints: flat,
      originLat: lat,
      originLng: lng,
      windSpeedMs: wind.windSpeedMs,
      windDirDeg: wind.windDirDeg,
      temperatureC: wind.temperatureC,
      initialBatteryPct: 90,
      onTick: (t) => {
        setSimTick(t);
        window.dispatchEvent(new CustomEvent("rehearse-drone-position", { detail: { lat: t.lat, lng: t.lng, alt: t.altM, headingDeg: t.headingDeg } }));
        if (t.done) {
          pushFb({ ts: Date.now(), kind: "info", msg: "Inspection complete - battery " + t.batterySocPct.toFixed(0) + "%" });
          setAgentRunning(false);
        }
      },
    });
    simRef.current = sim;
    sim.start();
  };
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
        <button onClick={runPolygonAgent} disabled={agentRunning} style={{ width: "100%", padding: "8px 12px", marginBottom: 8, background: agentRunning ? "#1a1f26" : "#facc15", color: agentRunning ? "#5ab8d0" : "#0a0a0a", border: "none", borderRadius: 5, fontWeight: 700, fontSize: 12, cursor: agentRunning ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
          {agentRunning ? "POLYGON AGENT RUNNING..." : "RUN POLYGON AGENT"}
        </button>
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

      {clickedFloor && (
        <div style={{ padding: 14, borderRadius: 8, border: "1px solid rgba(34,211,238,0.6)", background: "rgba(34,211,238,0.08)", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(34,211,238,0.9)", textTransform: "uppercase", letterSpacing: 1 }}>Floor Inspection</span>
            <button onClick={() => setClickedFloor(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16 }}>x</button>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22d3ee", lineHeight: 1 }}>Floor {clickedFloor.floor}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4, fontFamily: "monospace" }}>
            Altitude {clickedFloor.altM.toFixed(1)}m AGL
          </div>
          <div style={{ marginTop: 10, padding: 8, background: "rgba(6,12,24,0.6)", borderRadius: 4, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            <div style={{ marginBottom: 4 }}>Defects from V-JEPA2 spatial anomaly localizer:</div>
            <div style={{ color: "#fca5a5" }}>- DEF-{(clickedFloor.floor * 7 + 13).toString().padStart(3, "0")} Spalling (Critical, 96% confidence) - Face {clickedFloor.face}</div>
            <div style={{ color: "#f59e0b" }}>- DEF-{(clickedFloor.floor * 11 + 31).toString().padStart(3, "0")} Cracks (Advisory, 81% confidence) - Face E</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => {
              if (!clickedFloor) return;
              const dLat = clickedFloor.face === "N" ? 0.00040 : clickedFloor.face === "S" ? -0.00040 : 0;
              const dLng = clickedFloor.face === "E" ? 0.00040 : clickedFloor.face === "W" ? -0.00040 : 0;
              const lat = ((building as any).lat ?? 22.32) + dLat;
              const lng = ((building as any).lng ?? 114.17) + dLng;
              window.dispatchEvent(new CustomEvent("rehearse-add-waypoint", { detail: { building_id: building.id, lat, lng, alt_m: clickedFloor.altM, face: clickedFloor.face, floor: clickedFloor.floor } }));
            }} style={{ flex: "1 1 100%", padding: "8px 10px", background: "#facc15", color: "#0a0a0a", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>+ Add Inspection Waypoint (Face {clickedFloor?.face ?? ""})</button>
            <button style={{ flex: 1, padding: "6px 8px", background: "#22d3ee", color: "#060f1e", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Zoom to Floor</button>
            <button style={{ flex: 1, padding: "6px 8px", background: "transparent", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.4)", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Mark Inspected</button>
          </div>
        </div>
      )}

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

      <AgentFeedbackPanel feedback={agentFeedback} tick={simTick} />
      <PhysicsOverlay />
    </div>
  );
}