"use client";
import { useState, Suspense, lazy } from "react";

const TABS = [
  { id: "orchestration", label: "Orchestration" },
  { id: "radar",         label: "Radar" },
  { id: "waypoint",      label: "Waypoint Engine" },
  { id: "sensors",       label: "Sensors" },
];

const OrchestrationTab  = lazy(() => import("./_tabs/OrchestrationTab"));
const RadarTab          = lazy(() => import("./_tabs/RadarTab"));
const WaypointEngineTab = lazy(() => import("./_tabs/WaypointEngineTab"));
const SensorsTab        = lazy(() => import("./_tabs/SensorsTab"));

export default function RobotSpecsPage() {
  const [tab, setTab] = useState("orchestration");

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Robot Specs</h1>
        <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>NERM-R1 · AuraSense Tendon Robot · STDP v3.2</div>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1a1f26" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", borderRadius: "8px 8px 0 0", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              background: tab === t.id ? "rgba(79,152,163,.15)" : "transparent",
              border: tab === t.id ? "1px solid rgba(79,152,163,.4)" : "1px solid transparent",
              borderBottom: tab === t.id ? "1px solid #060f1e" : "none",
              color: tab === t.id ? "#5ab8d0" : "#8b9aae",
              marginBottom: tab === t.id ? -1 : 0,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <Suspense fallback={<div style={{ color: "#8b9aae", fontSize: 12, padding: 20 }}>Loading…</div>}>
        {tab === "orchestration" && <OrchestrationTab />}
        {tab === "radar"         && <RadarTab />}
        {tab === "waypoint"      && <WaypointEngineTab />}
        {tab === "sensors"       && <SensorsTab />}
      </Suspense>
    </main>
  );
}
