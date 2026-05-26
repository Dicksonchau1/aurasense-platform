"use client";

import React from "react";
import { useFleet } from "@/lib/hooks/useAtlasOps";
import type { FleetItem } from "@/lib/types/atlas";

// TODO: VERIFY — original page used STATUS_META and batteryColor helpers.
// Restore these from the existing src/app/dashboard/fleet/page.tsx that mock-imported @/lib/mock/ops.
const STATUS_META: Record<FleetItem["status"], { bg: string; fg: string; dot: string; label: string }> = {
  ready:    { bg: "#064e3b", fg: "#a7f3d0", dot: "#10b981", label: "Ready"    },
  charging: { bg: "#1e3a8a", fg: "#bfdbfe", dot: "#3b82f6", label: "Charging" },
  fault:    { bg: "#7f1d1d", fg: "#fecaca", dot: "#ef4444", label: "Fault"    },
  offline:  { bg: "#374151", fg: "#9ca3af", dot: "#4b5563", label: "Offline"  },
};

function batteryColor(pct: number): string {
  if (pct < 20) return "#ef4444";
  if (pct < 50) return "#f59e0b";
  return "#10b981";
}

export default function FleetPage() {
  const { fleet, isLoading, error } = useFleet();
  const [typeFilter, setTypeFilter] = React.useState<"all" | FleetItem["class"]>("all");

  const visible = fleet.filter(f => typeFilter === "all" || f.class === typeFilter);

  if (error) {
    return (
      <div style={{ padding: 24, color: "#fca5a5" }}>
        Failed to load fleet: {error.message ?? "unknown error"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: "rgba(255,255,255,0.4)" }}>
        Loading fleet…
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "#e0e8f2" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Fleet</h1>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, padding: 4, background: "#111827", border: "1px solid #1f2937", borderRadius: 8, width: "fit-content" }}>
        {(["all", "drone", "robot", "agent"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: "6px 14px",
              background: typeFilter === t ? "#22d3ee" : "transparent",
              color: typeFilter === t ? "#0a0e15" : "#9ca3af",
              border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600,
              cursor: "pointer", textTransform: "capitalize",
            }}
          >
            {t === "all" ? "All" : t + "s"}
          </button>
        ))}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {visible.map(asset => {
          const meta = STATUS_META[asset.status];
          return (
            <article
              key={asset.id}
              style={{
                background: "#0f172a",
                border: "1px solid #1f2937",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>{asset.name}</strong>
                <span style={{ background: meta.bg, color: meta.fg, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>
                  {meta.label}
                </span>
              </header>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "capitalize" }}>
                {asset.class}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${asset.battery_pct}%`, height: "100%", background: batteryColor(asset.battery_pct) }} />
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{asset.battery_pct}%</span>
              </div>
            </article>
          );
        })}
      </section>

      {visible.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 24 }}>
          No assets match this filter.
        </p>
      )}
    </div>
  );
}