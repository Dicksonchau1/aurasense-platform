"use client";

import { useState } from "react";
import Link from "next/link";
import SubNav, { type SubNavItem } from "../_components/SubNav";
import ParametersTab from "./_tabs/ParametersTab";
import RegistryTab from "./_tabs/RegistryTab";
import SupervisedTab from "./_tabs/SupervisedTab";
import CalibrationTab from "./_tabs/CalibrationTab";
import SweepTab from "./_tabs/SweepTab";
import DroneLiveTab from "./_tabs/DroneLiveTab";

const TABS: SubNavItem[] = [
  { id: "params",     label: "Parameters" },
  { id: "registry",   label: "Registry" },
  { id: "supervised", label: "Supervised Action" },
  { id: "cal",        label: "Calibration" },
  { id: "sweep",      label: "Sweep Engine" },
  { id: "live",       label: "Drone Live" },
];

export default function DroneSpecsPage() {
  const [tab, setTab] = useState("params");

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#8b9aae" }}>
        <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span>Drone Specs</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Drone Specs</h1>
        <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(46,125,82,.14)", color: "#6ee7a4", border: "1px solid rgba(46,125,82,.3)" }}>
          NERM-A1 ACTIVE
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "start" }}>
        <SubNav title="Drone Specs" items={TABS} activeId={tab} onSelect={setTab} />
        <div style={{ minWidth: 0 }}>
          {tab === "params"     && <ParametersTab />}
          {tab === "registry"   && <RegistryTab />}
          {tab === "supervised" && <SupervisedTab />}
          {tab === "cal"        && <CalibrationTab />}
          {tab === "sweep"      && <SweepTab />}
          {tab === "live"       && <DroneLiveTab />}
        </div>
      </div>
    </main>
  );
}
