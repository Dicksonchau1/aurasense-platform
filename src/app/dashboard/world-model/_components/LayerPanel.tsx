"use client";

import { useState } from "react";
import { Card } from "../../_components/SpecCard";
import { WM_LAYERS } from "@/lib/mock/world-model";

export default function LayerPanel() {
  const [layers, setLayers] = useState(WM_LAYERS);
  const toggle = (key: string) =>
    setLayers((arr) =>
      arr.map((l) => (l.key === key ? { ...l, on: !l.on } : l)),
    );

  const onCount = layers.filter((l) => l.on).length;

  return (
    <Card title="Layer Controls">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#8b9aae" }}>
          {onCount}/{layers.length} visible
        </span>
        <button
          onClick={() => setLayers((arr) => arr.map((l) => ({ ...l, on: true })))}
          style={btnSm}
        >
          All on
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {layers.map((l) => (
          <div
            key={l.key}
            onClick={() => toggle(l.key)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 9px",
              borderRadius: 6,
              background: l.on ? "rgba(79,152,163,.08)" : "rgba(255,255,255,.02)",
              border: "1px solid " + (l.on ? "rgba(79,152,163,.25)" : "#1a1f26"),
              cursor: "pointer",
              transition: "background .14s",
            }}
          >
            <span style={{ fontSize: 11.5, color: l.on ? "#cfd8e3" : "#6b7a8c", fontWeight: 500 }}>
              {l.name}
            </span>
            <div
              style={{
                width: 30,
                height: 16,
                borderRadius: 999,
                background: l.on ? "linear-gradient(90deg,#2e6b74,#4f98a3)" : "rgba(90,122,168,.25)",
                border: "1px solid " + (l.on ? "transparent" : "rgba(90,122,168,.3)"),
                position: "relative",
                transition: "background .18s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 1,
                  left: l.on ? 17 : 2,
                  transition: "left .18s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const btnSm: React.CSSProperties = {
  padding: "3px 9px",
  borderRadius: 5,
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid #1a1f26",
  background: "rgba(255,255,255,.05)",
  color: "#cfd8e3",
};
