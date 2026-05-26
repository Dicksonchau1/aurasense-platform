"use client";

import { Card, Badge } from "./SpecCard";
import { ALERTS, type AlertSeverity } from "@/lib/mock/ops";

const SEV_COLOR: Record<AlertSeverity, { dot: string; bg: string; bd: string; pill: "danger" | "warn" | "info" }> = {
  danger: { dot: "#ef4444", bg: "rgba(185,28,28,.07)", bd: "rgba(185,28,28,.3)",  pill: "danger" },
  warn:   { dot: "#f59e0b", bg: "rgba(180,83,9,.07)",  bd: "rgba(180,83,9,.3)",   pill: "warn"   },
  info:   { dot: "#5ab8d0", bg: "rgba(79,152,163,.07)", bd: "rgba(79,152,163,.3)", pill: "info"   },
};

export default function AlertsPanel() {
  return (
    <Card title="Active Alerts">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#8b9aae" }}>
          {ALERTS.filter((a) => a.sev === "danger").length} critical / {ALERTS.length} total
        </span>
        <button style={btnSm}>Acknowledge All</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ALERTS.map((a) => {
          const c = SEV_COLOR[a.sev];
          return (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "9px 11px",
                borderRadius: 8,
                background: c.bg,
                border: "1px solid " + c.bd,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, marginTop: 6, flexShrink: 0, boxShadow: "0 0 6px " + c.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#e0e8f2" }}>{a.type}</span>
                    <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#5ab8d0" }}>{a.drone}</span>
                  </div>
                  <Badge kind={c.pill}>{a.sev}</Badge>
                </div>
                <div style={{ fontSize: 11.5, color: "#cfd8e3", marginBottom: 4, lineHeight: 1.4 }}>{a.msg}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9.5, fontFamily: "ui-monospace, monospace", color: "#6b7a8c" }}>
                    {a.id} - {a.t}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={btnSm}>ACK</button>
                    <button style={btnSm}>Mute</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const btnSm: React.CSSProperties = { padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid #1a1f26", background: "rgba(255,255,255,.05)", color: "#cfd8e3" };
