"use client";

import { Card, Row, Badge } from "../../_components/SpecCard";
import { WP_ENGINE_CFG } from "@/lib/mock/robot-specs";

export default function WaypointEngineTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
      <Card title="Waypoint Engine">
        <div style={{ position: "relative", height: 280, borderRadius: 10, overflow: "hidden", background: "#060f1e", border: "1px solid #1a1f26", marginBottom: 10 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(79,152,163,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,152,163,.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {[
            { x: 12, y: 20, id: "01" },
            { x: 32, y: 35, id: "02" },
            { x: 48, y: 22, id: "03" },
            { x: 62, y: 58, id: "04" },
            { x: 78, y: 38, id: "05" },
          ].map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: p.x + "%",
                top: p.y + "%",
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(79,152,163,.9)",
                color: "#fff",
                fontSize: 9.5,
                fontWeight: 800,
                fontFamily: "ui-monospace, monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 8px rgba(79,152,163,.5)",
              }}
            >
              {p.id}
            </div>
          ))}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <polyline
              points="12%,20% 32%,35% 48%,22% 62%,58% 78%,38%"
              fill="none"
              stroke="rgba(79,152,163,.55)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
          </svg>
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "rgba(79,152,163,.6)" }}>
            Click to drop waypoints - drag to reorder
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button style={btnT}>Optimise Route</button>
          <button style={btnG}>Clear</button>
          <button style={btnG}>Export JSON</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card title="Active Waypoints">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["WP-01 0.12, 0.20","WP-02 0.32, 0.35","WP-03 0.48, 0.22","WP-04 0.62, 0.58","WP-05 0.78, 0.38"].map((w, i) => (
              <div key={w} style={{ display: "flex", justifyContent: "space-between", padding: "5px 9px", borderRadius: 6, background: "rgba(79,152,163,.06)", border: "1px solid rgba(79,152,163,.15)", fontSize: 11.5 }}>
                <span style={{ color: "#5ab8d0", fontFamily: "ui-monospace, monospace" }}>WP-{String(i + 1).padStart(2, "0")}</span>
                <span style={{ color: "#cfd8e3", fontFamily: "ui-monospace, monospace" }}>{w.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1f26" }}>
            <Row label="Total distance">412 m</Row>
            <Row label="Est. time">3 min 26 s</Row>
            <Row label="Battery">14%</Row>
          </div>
        </Card>

        <Card title="WP Engine Config">
          {WP_ENGINE_CFG.map((s) =>
            s.badge ? (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
                <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
                <Badge kind={s.badge}>{s.value}</Badge>
              </div>
            ) : (
              <Row key={s.label} label={s.label}>{s.value}</Row>
            )
          )}
        </Card>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
