"use client";

import { useMission } from "@/lib/mission/context";
import { calcDist } from "@/lib/mission/wpEngine";

export default function Hud() {
  const m = useMission();
  const dist = Math.round(calcDist(m.wps));
  const tm = m.cfg.spd > 0 ? Math.round(dist / m.cfg.spd) : 0;
  const bat = Math.min(99, Math.round((tm / 60 / 41) * 60 + 100 * 0.05));
  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
        <Chip>NERM-A1 STANDBY</Chip>
        <Chip>22.3193N 114.1694E Alt {m.cfg.alt}m</Chip>
        <Chip>Wind {m.phy.wind.toFixed(1)}m/s SW</Chip>
        <Chip kind="am">Glare risk: Med ({m.phy.sun} deg)</Chip>
      </div>
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
        <Chip>WPs: {m.wps.length}</Chip>
        <Chip>Dist: {dist ? dist + "m" : "--"}</Chip>
        <Chip>ETA: {tm ? Math.floor(tm / 60) + "m " + (tm % 60) + "s" : "--"}</Chip>
        <Chip>Battery: {dist ? bat + "%" : "--"}</Chip>
      </div>
      <div style={{ position: "absolute", bottom: 56, left: 10, display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
        <Chip>Drag: orbit | Scroll: zoom | Shift+drag: pan</Chip>
        {m.sim && <Chip>Simulating: {Math.round(m.simT)}%</Chip>}
      </div>
    </>
  );
}

function Chip({ children, kind }: { children: React.ReactNode; kind?: "am" | "rd" }) {
  const borderColor = kind === "am" ? "rgba(245,158,11,.4)" : kind === "rd" ? "rgba(239,68,68,.4)" : "rgba(8,145,178,.28)";
  const color = kind === "am" ? "rgba(251,191,36,.9)" : kind === "rd" ? "rgba(248,113,113,.9)" : "rgba(210,240,255,.85)";
  return <div style={{ background: "rgba(5,14,26,.82)", backdropFilter: "blur(8px)", border: "1px solid " + borderColor, borderRadius: 5, padding: "3px 9px", fontSize: 10, fontFamily: "ui-monospace, monospace", color, whiteSpace: "nowrap" }}>{children}</div>;
}
