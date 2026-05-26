"use client";

import Link from "next/link";
import { Card } from "../_components/SpecCard";
import WorldScene from "./_components/WorldScene";
import AgentDock from "./_components/AgentDock";
import LayerPanel from "./_components/LayerPanel";
import BuildingsPanel from "./_components/BuildingsPanel";
import AnomaliesPanel from "./_components/AnomaliesPanel";

export default function WorldModelPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 10, height: "calc(100vh - 140px)", minHeight: 0 }}>
      <div style={{ fontSize: 12, color: "#8b9aae" }}>
        <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span>World Model</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>World Model</h1>
          <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>
            Live 3D scene - HK skyline - 12 buildings - 4 anomalies
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(46,125,82,.14)", color: "#6ee7a4", border: "1px solid rgba(46,125,82,.3)" }}>
            STREAM LIVE
          </span>
          <button style={btnG}>Export glTF</button>
        </div>
      </div>

      {/* Workbench: 3D viewport + right rail */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 10,
          flex: 1,
          minHeight: 500,
        }}
      >
        {/* 3D viewport with HUD overlays */}
        <div
          style={{
            position: "relative",
            border: "1px solid #1a1f26",
            borderRadius: 12,
            overflow: "hidden",
            background: "#060f1e",
            minHeight: 0,
          }}
        >
          <WorldScene />

          {/* HUD top-left */}
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
            <HudChip>NERM-A1 SCAN-ACTIVE</HudChip>
            <HudChip>22.3284N 114.1675E</HudChip>
          </div>

          {/* HUD top-right */}
          <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
            <HudChip>ALT 82m AGL</HudChip>
            <HudChip>WIND 5.2 m/s (220 deg)</HudChip>
            <HudChip>SUN 45 deg</HudChip>
          </div>

          {/* HUD bottom hint */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 9.5,
              fontFamily: "ui-monospace, monospace",
              color: "rgba(79,152,163,.6)",
              pointerEvents: "none",
            }}
          >
            Click-drag to orbit - Scroll to zoom - Drag drone avatar to simulate
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", minHeight: 0 }}>
          <LayerPanel />
          <BuildingsPanel />
          <AnomaliesPanel />
        </div>
      </div>

      {/* Agent dock (floating) */}
      <AgentDock />
    </main>
  );
}

function HudChip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(6,15,30,.55)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(79,152,163,.3)",
        borderRadius: 5,
        padding: "3px 9px",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        color: "rgba(255,255,255,.85)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

const btnG: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 6,
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid #1a1f26",
  background: "rgba(255,255,255,.06)",
  color: "#cfd8e3",
};
