"use client";
import { useState, Suspense, lazy } from "react";

const TABS = [
  { id: "parameters",  label: "Parameters" },
  { id: "registry",    label: "Registry" },
  { id: "supervised",  label: "Supervised Actions" },
  { id: "calibration", label: "Calibration" },
  { id: "sweep",       label: "Sweep Engine" },
  { id: "live",        label: "Drone Live" },
];

const ParametersTab  = lazy(() => import("./_tabs/ParametersTab"));
const RegistryTab    = lazy(() => import("./_tabs/RegistryTab"));
const SupervisedTab  = lazy(() => import("./_tabs/SupervisedTab"));
const CalibrationTab = lazy(() => import("./_tabs/CalibrationTab"));
const SweepTab       = lazy(() => import("./_tabs/SweepTab"));
const DroneLiveTab   = lazy(() => import("./_tabs/DroneLiveTab"));

export default function DroneSpecsPage() {
  const [tab, setTab] = useState("parameters");

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Drone Specs</h1>
          <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>NERM-A1 · DJI Matrice 30T · Serial M30T-202503-00142</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1a1f26", paddingBottom: 0 }}>
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
        {tab === "parameters"  && <ParametersTab />}
        {tab === "registry"    && <RegistryTab />}
        {tab === "supervised"  && <SupervisedTab />}
        {tab === "calibration" && <CalibrationTab />}
        {tab === "sweep"       && <SweepTab />}
        {tab === "live"        && <DroneLiveTab />}
      </Suspense>
    </main>
  );
}
