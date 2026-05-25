'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaneMetric { label: string; value: string; trend?: "up" | "down" | "flat"; good?: boolean; }
interface Pane { id: string; title: string; subtitle: string; status: "online" | "degraded" | "offline"; metrics: PaneMetric[]; hint: string; }

const PANES: Pane[] = [
  { id: "sensor-fusion", title: "Sensor Fusion", subtitle: "Multi-modal perception substrate", status: "online",
    metrics: [
      { label: "Spike rate",       value: "184 kHz", trend: "flat", good: true },
      { label: "Modalities fused", value: "4 / 4",   trend: "flat", good: true },
      { label: "Confidence (avg)", value: "0.94",    trend: "up",   good: true },
      { label: "Drift detected",   value: "no",      trend: "flat", good: true },
    ],
    hint: "RGB + thermal + LiDAR + IMU all healthy." },
  { id: "world-model", title: "World Model", subtitle: "Predicted vs measured site state", status: "online",
    metrics: [
      { label: "Envelope size",     value: "2,847 voxels", trend: "up",   good: true },
      { label: "Prediction error",  value: "0.21 m",       trend: "down", good: true },
      { label: "Replay coverage",   value: "98.6%",        trend: "up",   good: true },
      { label: "Divergences (24h)", value: "2",            trend: "flat", good: true },
    ],
    hint: "Active mission MSN-007 within predicted envelope." },
  { id: "ardupilot", title: "ArduPilot Console", subtitle: "Vehicle link + mode + telemetry", status: "online",
    metrics: [
      { label: "Link status",  value: "Connected", trend: "flat", good: true },
      { label: "Current mode", value: "AUTO",      trend: "flat", good: true },
      { label: "Battery",      value: "82%",       trend: "down", good: true },
      { label: "RTK fix",      value: "Fixed",     trend: "flat", good: true },
    ],
    hint: "DRN-12 in AUTO, 22 of 34 waypoints complete." },
  { id: "calibration", title: "Calibration", subtitle: "Site-tuned NEPA baseline", status: "degraded",
    metrics: [
      { label: "Baseline age",    value: "27 days",   trend: "flat", good: false },
      { label: "Drift score",     value: "0.034",     trend: "up",   good: false },
      { label: "Audit cert",      value: "Valid",     trend: "flat", good: true  },
      { label: "Recalibrate due", value: "in 3 days", trend: "flat", good: false },
    ],
    hint: "Drift trending upward — schedule recalibration this week." },
];

const STATUS_STYLE = {
  online:   { bg: "#065f46", fg: "#a7f3d0", dot: "#10b981", label: "Online"   },
  degraded: { bg: "#78350f", fg: "#fde68a", dot: "#f59e0b", label: "Degraded" },
  offline:  { bg: "#7f1d1d", fg: "#fecaca", dot: "#ef4444", label: "Offline"  },
} as const;

const TREND_ARROW = { up: "up", down: "down", flat: "flat" } as const;

export default function WorldModelDashboard() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0e15", color: "#e5e7eb", fontFamily: "system-ui", padding: "32px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, borderBottom: "1px solid #1f2937", paddingBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 8px", color: "#374151" }}>/</span>
            <span>World Model</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>World Model — Live Workspace</h1>
          <p style={{ color: "#9ca3af", marginTop: 6, fontSize: 14 }}>Sensor fusion, predicted-vs-actual world state, ArduPilot integration, and site calibration.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live clock</div>
          <div style={{ fontSize: 22, fontFamily: "ui-monospace, monospace", color: "#22d3ee", marginTop: 4 }}>{now || "--:--:--"}</div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {PANES.map(p => {
          const st = STATUS_STYLE[p.status];
          return (
            <article key={p.id} style={{ background: "#111827", borderRadius: 10, border: "1px solid #1f2937", padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{p.title}</h2>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0 0" }}>{p.subtitle}</p>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: st.bg, color: st.fg, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: st.dot, display: "inline-block" }} />
                  {st.label}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {p.metrics.map((m, i) => (
                  <div key={i} style={{ background: "#0a0e15", border: "1px solid #1f2937", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: m.good === false ? "#f59e0b" : "#e5e7eb" }}>{m.value}</span>
                      {m.trend && (
                        <span style={{ fontSize: 11, color: m.trend === "up" ? "#10b981" : m.trend === "down" ? "#22d3ee" : "#6b7280" }}>
                          {TREND_ARROW[m.trend]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #1f2937", fontSize: 12, color: "#9ca3af" }}>
                {p.hint}
              </div>
            </article>
          );
        })}
      </section>

      <section style={{ marginTop: 24, background: "#111827", borderRadius: 10, border: "1px solid #1f2937", padding: 22 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0" }}>Substrate health summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Active missions</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>1</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>MSN-007 in progress</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sites monitored</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>14</div>
            <div style={{ fontSize: 12, color: "#10b981", marginTop: 2 }}>All baselines current</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>SLA compliance (30d)</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: "#10b981" }}>99.4%</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>+0.2% vs last period</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Postflight quota used</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>62 / 100</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>flights this month</div>
          </div>
        </div>
      </section>
    </main>
  );
}
