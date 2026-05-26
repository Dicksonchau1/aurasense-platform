"use client";

import { Card } from "./SpecCard";
import { ACTIVITY } from "@/lib/mock/ops";

const ICON_COLOR: Record<string, string> = {
  "[deploy]": "#5ab8d0",
  "[ack]":    "#22c55e",
  "[scan]":   "#3b82f6",
  "[rth]":    "#f59e0b",
  "[cal]":    "#a78bfa",
  "[audit]":  "#6ee7a4",
};

export default function ActivityPanel() {
  return (
    <Card title="Activity Feed">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#8b9aae" }}>Live tail - newest first</span>
        <button style={btnSm}>View All</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ACTIVITY.map((a, i) => {
          const color = ICON_COLOR[a.i] ?? "#8b9aae";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                padding: "7px 9px",
                borderRadius: 6,
                borderBottom: i === ACTIVITY.length - 1 ? "none" : "1px solid rgba(26,31,38,.5)",
                fontSize: 11.5,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "ui-monospace, monospace",
                  color,
                  flexShrink: 0,
                  width: 56,
                  fontWeight: 700,
                }}
              >
                {a.i}
              </span>
              <div style={{ flex: 1, minWidth: 0, color: "#cfd8e3", lineHeight: 1.45 }}>{a.m}</div>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "#6b7a8c", flexShrink: 0 }}>{a.t}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const btnSm: React.CSSProperties = { padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid #1a1f26", background: "rgba(255,255,255,.05)", color: "#cfd8e3" };
