"use client";

import { useMission } from "@/lib/mission/context";

export default function Topbar() {
  const m = useMission();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 14px", height: 44, background: "rgba(17,27,40,.95)", borderBottom: "1px solid rgba(8,145,178,.18)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#1e4080,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>AS</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e0eeff" }}>AuraSense</span>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: "rgba(8,145,178,.15)", color: "#5ab8d0", border: "1px solid rgba(8,145,178,.3)" }}>ATLAS OS</span>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: "rgba(8,145,178,.15)", color: "#5ab8d0", border: "1px solid rgba(8,145,178,.3)" }}>Mission Planner</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: "rgba(34,197,94,.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,.3)" }}>ATLAS Fit {m.fit}/100</span>
        <button onClick={m.undoWP} style={btnG}>Undo</button>
        <button onClick={m.clearWPs} style={btnG}>Clear</button>
        <button onClick={m.optimiseWPs} style={btnG}>Optimise</button>
        <button onClick={m.sim ? m.stopSim : m.startSim} style={btnP}>{m.sim ? "Stop" : "Simulate"}</button>
        <button onClick={() => m.toast("Mission deployed to NERM-A1", "success")} style={btnS}>Deploy</button>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = { height: 28, padding: "0 11px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "none", transition: "all .14s" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.07)", border: "1px solid rgba(8,145,178,.18)", color: "#d6e4f0" };
const btnP: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#1e4080,#0891b2)", color: "#fff" };
const btnS: React.CSSProperties = { ...btnBase, background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)", color: "#4ade80" };
