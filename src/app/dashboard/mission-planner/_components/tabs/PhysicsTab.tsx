"use client";

import { useMission } from "@/lib/mission/context";

export default function PhysicsTab() {
  const m = useMission();
  const glare = m.phy.sun < 30 ? "Low" : m.phy.sun < 60 ? "Medium" : "High";
  const glarePill: "ok" | "warn" | "danger" =
    m.phy.sun < 30 ? "ok" : m.phy.sun < 60 ? "warn" : "danger";
  const windBatPenalty = Math.round(m.phy.wind / 20 * 20);
  const shadow = (1 / Math.tan(((90 - m.phy.sun) * Math.PI) / 180) || 0).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={sectionHead}>Wind</div>
      <div style={row}>
        <span style={rowLabel}>Speed</span>
        <span style={rowVal}>{m.phy.wind.toFixed(1)} m/s</span>
      </div>
      <div style={{ height: 4, background: "rgba(79,152,163,.12)", borderRadius: 999, overflow: "hidden", margin: "0 8px" }}>
        <div style={{ width: (m.phy.wind / 20) * 100 + "%", height: "100%", background: "#0891b2", transition: "width .25s" }} />
      </div>
      <input
        type="range"
        min={0}
        max={20}
        step={0.1}
        value={m.phy.wind}
        onChange={(e) => m.setPhy({ wind: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: "#4f98a3", margin: "6px 0 4px" }}
      />
      <div style={row}>
        <span style={rowLabel}>Bat. penalty</span>
        <span style={rowVal}>{windBatPenalty}%</span>
      </div>

      <div style={sectionHead}>Solar</div>
      <div style={row}>
        <span style={rowLabel}>Angle</span>
        <span style={rowVal}>{m.phy.sun} deg</span>
      </div>
      <div style={{ height: 4, background: "rgba(79,152,163,.12)", borderRadius: 999, overflow: "hidden", margin: "0 8px" }}>
        <div style={{ width: (m.phy.sun / 90) * 100 + "%", height: "100%", background: "#f59e0b", transition: "width .25s" }} />
      </div>
      <input
        type="range"
        min={0}
        max={90}
        value={m.phy.sun}
        onChange={(e) => m.setPhy({ sun: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: "#4f98a3", margin: "6px 0 4px" }}
      />
      <div style={row}>
        <span style={rowLabel}>Glare risk</span>
        <Pill kind={glarePill}>{glare}</Pill>
      </div>
      <div style={row}>
        <span style={rowLabel}>Shadow</span>
        <span style={rowVal}>{shadow}x</span>
      </div>

      <div style={sectionHead}>Environment</div>
      <div style={row}><span style={rowLabel}>Temperature</span><span style={rowVal}>28 C</span></div>
      <div style={row}><span style={rowLabel}>Humidity</span><span style={rowVal}>69%</span></div>
      <div style={row}><span style={rowLabel}>Air density</span><span style={rowVal}>1.18 kg/m^3</span></div>
      <div style={row}><span style={rowLabel}>Visibility</span><span style={rowVal}>8 km</span></div>

      <div style={sectionHead}>Attitude</div>
      <div style={row}><span style={rowLabel}>Roll</span><span style={rowVal}>0.0 deg</span></div>
      <div style={row}><span style={rowLabel}>Pitch</span><span style={rowVal}>0.0 deg</span></div>
      <div style={row}><span style={rowLabel}>Yaw</span><span style={rowVal}>012 deg</span></div>
    </div>
  );
}

function Pill({ kind, children }: { kind: "ok" | "warn" | "danger"; children: React.ReactNode }) {
  const palette = {
    ok:     { bg: "rgba(46,125,82,.14)",  fg: "#6ee7a4", bd: "rgba(46,125,82,.3)"  },
    warn:   { bg: "rgba(180,83,9,.14)",   fg: "#fcd34d", bd: "rgba(180,83,9,.3)"   },
    danger: { bg: "rgba(185,28,28,.14)",  fg: "#fca5a5", bd: "rgba(185,28,28,.3)"  },
  }[kind];
  return <span style={{ display: "inline-flex", padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: palette.bg, color: palette.fg, border: "1px solid " + palette.bd }}>{children}</span>;
}

const sectionHead: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 11.5 };
const rowLabel: React.CSSProperties = { color: "#8b9aae" };
const rowVal: React.CSSProperties = { color: "#e0e8f2", fontFamily: "ui-monospace, monospace", fontWeight: 600 };
