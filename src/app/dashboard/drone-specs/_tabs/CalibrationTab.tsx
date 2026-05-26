"use client";

import { Card, Badge } from "../../_components/SpecCard";
import { CALIBRATION } from "@/lib/mock/drone-specs";

export default function CalibrationTab() {
  const passed = CALIBRATION.filter((c) => c.ok).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Card title="Calibration Sequence">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8b9aae" }}>
            {passed}/{CALIBRATION.length} steps passed
          </div>
          <Badge kind={passed === CALIBRATION.length ? "ok" : "warn"}>
            {passed === CALIBRATION.length ? "READY" : "ACTION NEEDED"}
          </Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CALIBRATION.map((c, i) => (
            <div
              key={c.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                background: c.ok ? "rgba(46,125,82,.06)" : "rgba(180,83,9,.06)",
                border: "1px solid " + (c.ok ? "rgba(46,125,82,.25)" : "rgba(180,83,9,.3)"),
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 26, height: 26, flexShrink: 0,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3b5d8d,#4f98a3)",
                  color: "#fff",
                  fontSize: 11, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e0e8f2" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#8b9aae", marginTop: 2 }}>{c.detail}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {c.ok
                  ? <Badge kind="ok">PASS</Badge>
                  : <Badge kind="warn">RETRY</Badge>}
                <button style={btnG}>Run Step</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button style={btnP}>Run Full Calibration</button>
          <button style={btnG}>Export Log</button>
          <button style={btnG}>Schedule Service</button>
        </div>
      </Card>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnP: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff", padding: "7px 14px", fontSize: 12 };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
