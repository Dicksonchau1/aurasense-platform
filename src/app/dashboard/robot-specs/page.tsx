"use client";

import { useState } from "react";
import Link from "next/link";
import SubNav, { type SubNavItem } from "../_components/SubNav";
import OrchestrationTab from "./_tabs/OrchestrationTab";
import RadarTab from "./_tabs/RadarTab";
import WaypointEngineTab from "./_tabs/WaypointEngineTab";
import SensorsTab from "./_tabs/SensorsTab";

const TABS: SubNavItem[] = [
  { id: "orch",    label: "Orchestration" },
  { id: "radar",   label: "Radar" },
  { id: "wp",      label: "Waypoint Engine" },
  { id: "sensors", label: "Sensors" },
];

export default function RobotSpecsPage() {
  const [tab, setTab] = useState("orch");

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#8b9aae" }}>
        <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span>Robot Specs</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Robot Specs</h1>
        <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(46,125,82,.14)", color: "#6ee7a4", border: "1px solid rgba(46,125,82,.3)" }}>
          NEPA v3.2 ONLINE
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "start" }}>
        <SubNav title="Robot Specs" items={TABS} activeId={tab} onSelect={setTab} />
        <div style={{ minWidth: 0 }}>
          {tab === "orch"    && <OrchestrationTab />}
          {tab === "radar"   && <RadarTab />}
          {tab === "wp"      && <WaypointEngineTab />}
          {tab === "sensors" && <SensorsTab />}
        </div>
      </div>
    </main>
  );
}
