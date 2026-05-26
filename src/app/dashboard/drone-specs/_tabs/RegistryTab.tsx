"use client";

import { Card } from "../../_components/SpecCard";
import { REGISTRY } from "@/lib/mock/drone-specs";

export default function RegistryTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Card title="Drone Registry">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {REGISTRY.map((f) => (
            <label key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {f.label}
              </span>
              <input
                type="text"
                defaultValue={f.value}
                style={{
                  height: 30,
                  borderRadius: 6,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid #1a1f26",
                  padding: "0 9px",
                  color: "#e0e8f2",
                  fontSize: 12.5,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              />
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button style={btnP}>Save</button>
          <button style={btnG}>Generate QR</button>
          <button style={btnG}>Export PDF</button>
          <button style={btnG}>View Audit Log</button>
        </div>
      </Card>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
};
const btnP: React.CSSProperties = {
  ...btnBase,
  background: "linear-gradient(135deg,#3b5d8d,#4f98a3)",
  color: "#fff",
};
const btnG: React.CSSProperties = {
  ...btnBase,
  background: "rgba(255,255,255,.06)",
  border: "1px solid #1a1f26",
  color: "#cfd8e3",
};
