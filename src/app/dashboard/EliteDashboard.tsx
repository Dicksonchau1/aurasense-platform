"use client";

import React from "react";
import StatCard from "../../components/stat-card";
import WorldModelViewer from "../../components/WorldModelViewer";
import MissionCreateForm from "../../components/mission-create-form";
import NotificationContext from "../../components/notification-context";
import TriggerRunButton from "../../components/trigger-run-button";
import RunTimeline from "../../components/run-timeline";
import STDPPanel from "../../components/STDPPanel";

export default function EliteDashboard() {
  return (
    <div style={{ padding: 32, background: "linear-gradient(180deg,#0f172a,#1e293b)", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, marginBottom: 24 }}>ATLAS Elite Dashboard</h1>
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard title="Active Missions" value={4} trend="up" />
        <StatCard title="Fleet Health" value="Nominal" trend="stable" />
        <StatCard title="Anomalies" value={2} trend="alert" />
        <StatCard title="Calibration Drift" value="0.034" trend="up" />
        <StatCard title="Battery Avg" value="82%" trend="down" />
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 2 }}>
          <WorldModelViewer />
          <div style={{ marginTop: 24 }}>
            <RunTimeline />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          <MissionCreateForm />
          <NotificationContext />
          <TriggerRunButton />
          <STDPPanel />
        </div>
      </div>
    </div>
  );
}
