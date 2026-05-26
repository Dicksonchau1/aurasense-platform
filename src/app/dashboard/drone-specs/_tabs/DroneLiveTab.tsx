"use client";

import { useState } from "react";
import { Card, Row, Badge } from "../../_components/SpecCard";
import { LIVE_TELEMETRY } from "@/lib/mock/drone-specs";

type Overlay = "normal" | "thermal" | "lidar" | "ndvi" | "grid";

interface Snapshot { id: number; at: string; }

export default function DroneLiveTab() {
  const [overlay, setOverlay] = useState<Overlay>("normal");
  const [recording, setRecording] = useState(false);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);

  const snap = () => {
    const id = snaps.length + 1;
    const at = new Date().toLocaleTimeString("en-HK", { hour12: false });
    setSnaps((s) => [{ id, at }, ...s].slice(0, 6));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Live feed canvas placeholder + HUD */}
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #1a1f26", background: overlay === "thermal" ? "linear-gradient(135deg,#3a0d11 0%,#0d1117 100%)" : overlay === "lidar" ? "linear-gradient(135deg,#06182b 0%,#020912 100%)" : overlay === "ndvi" ? "linear-gradient(135deg,#0e2a16 0%,#06120a 100%)" : "#0a1628", height: 320 }}>
          {/* HUD top-left */}
          <div style={{ position: "absolute", top: 10, left: 10, fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "rgba(255,255,255,.8)", display: "flex", flexDirection: "column", gap: 2, pointerEvents: "none" }}>
            <div style={{ color: recording ? "#fca5a5" : "rgba(255,255,255,.6)" }}>
              {recording ? "REC 00:12:44" : "REC OFF"}
            </div>
            <div>ALT 82m AGL</div>
            <div>RTK FIXED 0.08m</div>
          </div>

          {/* HUD top-right */}
          <div style={{ position: "absolute", top: 10, right: 10, fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "rgba(255,255,255,.8)", textAlign: "right", display: "flex", flexDirection: "column", gap: 2, pointerEvents: "none" }}>
            <div>NERM-A1</div>
            <div>BAT 87%</div>
            <div>WIND 4.8m/s</div>
          </div>

          {/* HUD bottom-right */}
          <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "rgba(255,255,255,.7)", pointerEvents: "none" }}>
            F2.8 - 1/800s - ISO400 - {overlay.toUpperCase()}
          </div>

          {/* Crosshair */}
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 18, height: 18, opacity: 0.45, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 1, background: "rgba(79,152,163,.85)" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 8, width: 1, background: "rgba(79,152,163,.85)" }} />
          </div>

          {/* Grid overlay if selected */}
          {overlay === "grid" && (
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(79,152,163,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(79,152,163,.18) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
          )}

          {/* Corner brackets */}
          <div style={{ position: "absolute", top: 8, left: 8, width: 12, height: 12, borderTop: "2px solid rgba(79,152,163,.7)", borderLeft: "2px solid rgba(79,152,163,.7)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 8, right: 8, width: 12, height: 12, borderTop: "2px solid rgba(79,152,163,.7)", borderRight: "2px solid rgba(79,152,163,.7)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 8, left: 8, width: 12, height: 12, borderBottom: "2px solid rgba(79,152,163,.7)", borderLeft: "2px solid rgba(79,152,163,.7)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 8, right: 8, width: 12, height: 12, borderBottom: "2px solid rgba(79,152,163,.7)", borderRight: "2px solid rgba(79,152,163,.7)", pointerEvents: "none" }} />
        </div>

        {/* Overlay modes */}
        <Card title="Overlay Modes">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {(["normal","thermal","lidar","ndvi","grid"] as const).map((o) => {
              const active = overlay === o;
              return (
                <button
                  key={o}
                  onClick={() => setOverlay(o)}
                  style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (active ? "transparent" : "#1a1f26"), background: active ? "linear-gradient(135deg,#3b5d8d,#4f98a3)" : "rgba(255,255,255,.06)", color: active ? "#fff" : "#cfd8e3", textTransform: "capitalize" }}
                >
                  {o}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={snap} style={btnP}>Snapshot</button>
            <button onClick={() => setRecording((r) => !r)} style={recording ? btnD : btnG}>
              {recording ? "Stop Rec" : "Record"}
            </button>
            <button style={btnG}>Replay</button>
            <button style={btnW}>RTH</button>
            <button style={btnD}>E-Land</button>
          </div>
        </Card>

        {/* Feed config */}
        <Card title="Feed Configuration">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <div>
              <Row label="Resolution">4K 30fps</Row>
              <Row label="Format">RAW+JPEG</Row>
              <Row label="Codec">H.265</Row>
            </div>
            <div>
              <Row label="Bitrate">120 Mbps</Row>
              <Row label="Lens">Facade 35</Row>
              <Row label="MP">48 MP</Row>
            </div>
            <div>
              <Row label="Gimbal">-45 deg</Row>
              <Row label="Zoom">1x optical</Row>
              <Row label="Stab.">3-axis</Row>
            </div>
            <div>
              <Row label="Latency">110 ms</Row>
              <Row label="Link">Excellent</Row>
              <Row label="Signal">-62 dBm</Row>
            </div>
          </div>
        </Card>
      </div>

      {/* Right column: telemetry, NERM, snapshots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Live Telemetry">
          {LIVE_TELEMETRY.map((t) => (
            <Row key={t.label} label={t.label}>{t.value}</Row>
          ))}
        </Card>

        <Card title="NERM State">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
            <span style={{ color: "#8b9aae", fontWeight: 500 }}>State</span>
            <Badge kind="ok">SCAN-ACTIVE</Badge>
          </div>
          <Row label="Face">North</Row>
          <Row label="Coverage">74%</Row>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
            <span style={{ color: "#8b9aae", fontWeight: 500 }}>Defects</span>
            <Badge kind="danger">3 found</Badge>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button style={btnW}>RTH</button>
            <button style={btnG}>Hover</button>
            <button style={btnD}>E-Land</button>
          </div>
        </Card>

        <Card title="Snapshot Gallery">
          {snaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: 18, color: "#6b7a8c", fontSize: 11 }}>
              No snapshots yet. Click Snapshot to capture.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {snaps.map((s) => (
                <div
                  key={s.id}
                  style={{
                    height: 52,
                    background: "linear-gradient(135deg,#0a1628,#1e3a5f)",
                    border: "1px solid rgba(79,152,163,.25)",
                    borderRadius: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(79,152,163,.85)",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 9.5,
                  }}
                >
                  <div style={{ fontSize: 14, marginBottom: 2 }}>#{s.id}</div>
                  <div>{s.at}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnP: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnW: React.CSSProperties = { ...btnBase, background: "rgba(180,83,9,.14)", border: "1px solid rgba(180,83,9,.3)", color: "#fcd34d" };
const btnD: React.CSSProperties = { ...btnBase, background: "rgba(185,28,28,.14)", border: "1px solid rgba(185,28,28,.3)", color: "#fca5a5" };
