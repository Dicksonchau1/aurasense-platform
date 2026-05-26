"use client";

import Link from "next/link";
import { MissionProvider } from "@/lib/mission/context";
import Topbar from "./_components/Topbar";
import Modebar from "./_components/Modebar";
import Hud from "./_components/Hud";
import Toast from "./_components/Toast";
import Viewport3D from "./_components/Viewport3D";
import RightPanel from "./_components/RightPanel";

export default function MissionPlannerPage() {
  return (
    <MissionProvider>
      <main style={{ display: "flex", flexDirection: "column", gap: 10, height: "calc(100vh - 140px)", minHeight: 0 }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "#8b9aae" }}>
          <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
          <span>Mission Planner</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Mission Planner</h1>
          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(46,125,82,.14)", color: "#6ee7a4", border: "1px solid rgba(46,125,82,.3)" }}>
            DRAFT
          </span>
        </div>

        {/* Topbar - mission action strip (Undo/Clear/Optimise/Simulate/Deploy) */}
        <Topbar />

        {/* Workbench: viewport + right panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 10,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Viewport with overlays */}
          <div
            style={{
              position: "relative",
              border: "1px solid #1a1f26",
              borderRadius: 12,
              overflow: "hidden",
              background: "#050e1a",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <Viewport3D />
            <Hud />
            <Modebar />
          </div>

          {/* Right panel - 5 tabs */}
          <RightPanel />
        </div>

        {/* Toast layer */}
        <Toast />
      </main>
    </MissionProvider>
  );
}
