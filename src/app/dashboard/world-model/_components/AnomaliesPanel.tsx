"use client";

import { Card, Badge } from "../../_components/SpecCard";
import { WM_DEFECTS } from "@/lib/mock/world-model";

const SEV_COLOR: Record<"danger" | "warn" | "info", string> = {
  danger: "#ef4444",
  warn:   "#f59e0b",
  info:   "#5ab8d0",
};

const SEV_LABEL: Record<"danger" | "warn" | "info", string> = {
  danger: "Critical",
  warn:   "Advisory",
  info:   "Low",
};

export default function AnomaliesPanel() {
  const counts = {
    danger: WM_DEFECTS.filter((d) => d.severity === "danger").length,
    warn:   WM_DEFECTS.filter((d) => d.severity === "warn").length,
    info:   WM_DEFECTS.filter((d) => d.severity === "info").length,
  };

  return (
    <Card title="Known Anomalies">
      <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
        <SummaryPill color="#ef4444" label="Critical" value={counts.danger} />
        <SummaryPill color="#f59e0b" label="Advisory" value={counts.warn} />
        <SummaryPill color="#5ab8d0" label="Low"      value={counts.info} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {WM_DEFECTS.map((d) => {
          const color = SEV_COLOR[d.severity];
          return (
            <div
              key={d.id}
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background: color + "0d",
                border: "1px solid " + color + "38",
                cursor: "pointer",
                transition: "background .14s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: "0 0 5px " + color }} />
                  <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#5ab8d0", fontWeight: 700 }}>{d.id}</span>
                  <span style={{ fontSize: 11.5, color: "#e0e8f2", fontWeight: 600 }}>{d.type}</span>
                </div>
                <Badge kind={d.severity}>{SEV_LABEL[d.severity]}</Badge>
              </div>
              <div style={{ fontSize: 10.5, color: "#8b9aae", marginTop: 4 }}>
                Face {d.face} - Level {d.level} - {d.confidence}% confidence
              </div>
              <div style={{ height: 3, background: "rgba(79,152,163,.15)", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                <div
                  style={{
                    width: d.confidence + "%",
                    height: "100%",
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SummaryPill({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "5px 8px",
        background: color + "14",
        border: "1px solid " + color + "38",
        borderRadius: 6,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: "#8b9aae", marginTop: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </div>
    </div>
  );
}
