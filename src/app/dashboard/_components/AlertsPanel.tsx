"use client";

import React from "react";
import { useAlerts } from "@/lib/hooks/useAtlasOps";
import type { AlertItem } from "@/lib/types/atlas";

const SEV_COLOR: Record<AlertItem["severity"], string> = {
  info:   "#3b82f6",
  warn:   "#f59e0b",
  danger: "#ef4444",
};

// TODO: VERIFY props shape — original AlertsPanel may have taken `assets` or other props.
// If so, restore them and pass through; the hook still drives the data.
export default function AlertsPanel() {
  const { alerts, isLoading, error } = useAlerts();

  if (error) {
    return (
      <div style={{ padding: 12, color: "#fca5a5", fontSize: 12 }}>
        Alerts unavailable: {error.message ?? "unknown"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        Loading alerts…
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={{ padding: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        No active alerts.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {alerts.slice(0, 10).map(a => (
        <article
          key={a.id}
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: 10, borderRadius: 8,
            background: "rgba(15,23,42,0.6)",
            border: `1px solid ${SEV_COLOR[a.severity]}44`,
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: SEV_COLOR[a.severity], flexShrink: 0, marginTop: 4,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#e0e8f2" }}>{a.message}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {a.source} · {new Date(a.ts).toLocaleTimeString()}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}