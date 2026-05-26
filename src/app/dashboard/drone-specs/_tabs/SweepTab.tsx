"use client";

import { Card, Row, Badge } from "../../_components/SpecCard";
import { SWEEP_PARAMS } from "@/lib/mock/drone-specs";

export default function SweepTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
      <Card title="Sweep Engine">
        <div style={{ position: "relative", height: 220, borderRadius: 10, overflow: "hidden", background: "#040d1a", border: "1px solid rgba(79,152,163,.3)", marginBottom: 10 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(79,152,163,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,152,163,.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(79,152,163,.9), transparent)", animation: "atlasSweep 2.8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontFamily: "ui-monospace, monospace", fontSize: 10, color: "rgba(79,152,163,.85)" }}>
            SCAN ACTIVE - 74%
          </div>
        </div>

        <style>{`@keyframes atlasSweep { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnT}>Start Sweep</button>
          <button style={btnG}>Pause</button>
          <button style={btnG}>Export Mission</button>
        </div>
      </Card>

      <Card title="Sweep Parameters">
        {SWEEP_PARAMS.map((s) =>
          s.label === "NERM zone" ? (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", borderRadius: 6, fontSize: 12 }}>
              <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
              <Badge kind="info">{s.value}</Badge>
            </div>
          ) : (
            <Row key={s.label} label={s.label}>{s.value}</Row>
          )
        )}

        <div style={{ marginTop: 12, padding: 10, background: "rgba(79,152,163,.05)", border: "1px solid rgba(79,152,163,.18)", borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Coverage Estimate</div>
          <div style={{ fontSize: 13, color: "#e0e8f2" }}>1,247 images at 0.8 cm/px - 14 min total - 38% battery</div>
        </div>
      </Card>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
