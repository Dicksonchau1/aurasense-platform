"use client";

import { useState } from "react";
import { Card, Badge } from "../../_components/SpecCard";
import { WM_BUILDINGS, type WMBuilding } from "@/lib/mock/world-model";

const STATUS_PILL: Record<WMBuilding["status"], "ok" | "warn" | "info"> = {
  scanning: "info",
  queued:   "warn",
  done:     "ok",
};

export default function BuildingsPanel() {
  const [active, setActive] = useState<string | null>("B-01");

  return (
    <Card title="Buildings & Zones">
      <div style={{ fontSize: 11, color: "#8b9aae", marginBottom: 8 }}>
        {WM_BUILDINGS.length} structures - {WM_BUILDINGS.filter((b) => b.status === "scanning").length} active scan
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {WM_BUILDINGS.map((b) => {
          const isActive = b.id === active;
          return (
            <div
              key={b.id}
              onClick={() => setActive(isActive ? null : b.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 9px",
                borderRadius: 7,
                background: isActive ? "rgba(79,152,163,.15)" : "rgba(255,255,255,.03)",
                border: "1px solid " + (isActive ? "rgba(79,152,163,.4)" : "#1a1f26"),
                cursor: "pointer",
                transition: "background .14s",
              }}
            >
              <div
                style={{
                  width: 24, height: 24,
                  borderRadius: 5,
                  background: "linear-gradient(135deg,#3b5d8d,#4f98a3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {b.id.slice(2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e0e8f2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.name}
                </div>
                <div style={{ fontSize: 9.5, color: "#8b9aae", fontFamily: "ui-monospace, monospace" }}>
                  {b.height}m - {b.floors}F
                </div>
              </div>
              <Badge kind={STATUS_PILL[b.status]}>{b.status}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
