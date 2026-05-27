"use client";

import type { AgentFeedback } from "./PolygonAgent";
import type { SimTick } from "./LiveDroneSimulator";

interface Props {
  feedback: AgentFeedback[];
  tick: SimTick | null;
}

export function AgentFeedbackPanel({ feedback, tick }: Props) {
  if (feedback.length === 0 && !tick) return null;
  const card: React.CSSProperties = { padding: 14, borderRadius: 8, border: "1px solid rgba(250,204,21,0.5)", background: "rgba(15,10,2,0.85)", marginBottom: 10 };
  const lbl: React.CSSProperties = { fontSize: 10, color: "rgba(250,204,21,0.95)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 };
  const colorFor = (k: AgentFeedback["kind"]) => k === "error" ? "#fca5a5" : k === "warn" ? "#facc15" : k === "tick" ? "rgba(255,255,255,0.55)" : "#cfd8e3";
  return (
    <div style={card}>
      <div style={lbl}>Polygon Agent</div>
      {tick && (
        <div style={{ padding: 8, background: "rgba(6,12,24,0.7)", borderRadius: 5, marginBottom: 8, fontFamily: "ui-monospace,monospace", fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#cfd8e3" }}>
            <span>WP {tick.currentWaypointIndex + 1}/{tick.totalWaypoints}</span>
            <span>{tick.progressPct.toFixed(0)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
            <span>ALT {tick.altM.toFixed(1)}m</span>
            <span>{tick.speedMs.toFixed(1)} m/s</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
            <span style={{ color: tick.batterySocPct < 25 ? "#fca5a5" : tick.batterySocPct < 50 ? "#facc15" : "#34d399" }}>BAT {tick.batterySocPct.toFixed(0)}%</span>
            <span>TH {tick.throttlePct.toFixed(0)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
            <span>WindRel {tick.windRelMs.toFixed(1)} m/s</span>
            <span>HDG {tick.headingDeg.toFixed(0)} deg</span>
          </div>
          {tick.warnings.length > 0 && (
            <div style={{ color: "#fca5a5", marginTop: 4, fontSize: 10 }}>! {tick.warnings.join(" - ")}</div>
          )}
        </div>
      )}
      <div style={{ maxHeight: 180, overflowY: "auto", fontFamily: "ui-monospace,monospace", fontSize: 10, lineHeight: 1.5 }}>
        {feedback.slice(-40).map((f, i) => (
          <div key={i} style={{ color: colorFor(f.kind), paddingBottom: 1 }}>
            <span style={{ opacity: 0.5 }}>{new Date(f.ts).toLocaleTimeString("en-HK", { hour12: false }).slice(3)}</span> {f.msg}
          </div>
        ))}
      </div>
    </div>
  );
}