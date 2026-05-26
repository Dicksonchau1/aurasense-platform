"use client";

import { useMission } from "@/lib/mission/context";
import type { DroneModel } from "@/lib/mission/projection";

export default function Modebar() {
  const m = useMission();
  return (
    <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4, padding: "5px 8px", background: "rgba(5,14,26,.85)", backdropFilter: "blur(14px)", border: "1px solid rgba(8,145,178,.3)", borderRadius: 10, zIndex: 20 }}>
      <ModeBtn label="Waypoint" active={m.mode === "wp"} onClick={() => m.setMode("wp")} />
      <ModeBtn label="Home" active={m.mode === "home"} onClick={() => m.setMode("home")} />
      <ModeBtn label="Exclusion" active={m.mode === "excl"} onClick={() => m.setMode("excl")} />
      <Sep />
      <ModeBtn label="Orbit" active={m.view === "orbit"} onClick={() => m.setView("orbit")} />
      <ModeBtn label="Street" active={m.view === "street"} onClick={() => m.setView("street")} />
      <ModeBtn label="Facade" active={m.view === "facade"} onClick={() => m.setView("facade")} />
      <Sep />
      <ModeBtn label="Physics" active={m.showPhysics} onClick={m.togglePhysics} />
      <ModeBtn label="Defects" active={m.showDefects} onClick={m.toggleDefects} />
      <select value={m.drone} onChange={(e) => m.setDrone(e.target.value as DroneModel)} style={{ height: 27, fontSize: 10.5, padding: "0 6px", background: "rgba(5,14,26,.85)", color: "rgba(180,210,240,.8)", border: "1px solid rgba(8,145,178,.18)", borderRadius: 6 }}>
        <option value="m30t">DJI M30T</option>
        <option value="m350">DJI M350</option>
        <option value="evo">EVO II Pro</option>
      </select>
    </div>
  );
}

function ModeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ height: 27, padding: "0 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: active ? "1px solid rgba(8,145,178,.55)" : "1px solid transparent", color: active ? "#fff" : "rgba(180,210,240,.65)", background: active ? "rgba(8,145,178,.28)" : "transparent", transition: "all .14s", whiteSpace: "nowrap" }}>{label}</button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />;
}
