"use client";

import React from "react";
import { useActivity } from "@/lib/hooks/useAtlasOps";

export default function ActivityPanel() {
  const { activity, isLoading, error } = useActivity();

  if (error) {
    return (
      <div style={{ padding: 12, color: "#fca5a5", fontSize: 12 }}>
        Activity unavailable: {error.message ?? "unknown"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        Loading activity…
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div style={{ padding: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        No recent activity.
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {activity.slice(0, 12).map((a, i) => (
        
          style={{
            padding: 10, borderRadius: 8,
            background: i % 2 === 0 ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.3)",
            border: "1px solid #1f2937",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#e0e8f2" }}>
              <strong style={{ color: "#22d3ee" }}>{a.actor}</strong> {a.action}
              {a.target && <span style={{ color: "rgba(255,255,255,0.7)" }}> {a.target}</span>}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
              {new Date(a.ts).toLocaleTimeString()}
            </span>
          </div>
          {a.audit_hash && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace, monospace", marginTop: 4 }}>
              {a.audit_hash.slice(0, 16)}…
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}