"use client";

import { useState } from "react";
import WaypointsTab from "./tabs/WaypointsTab";
import ConfigTab from "./tabs/ConfigTab";
import PhysicsTab from "./tabs/PhysicsTab";
import NepaTab from "./tabs/NepaTab";
import RobotTab from "./tabs/RobotTab";

type TabId = "wp" | "cfg" | "phy" | "nepa" | "robot";

export default function RightPanel() {
  const [tab, setTab] = useState<TabId>("wp");
  const tabs: { id: TabId; label: string }[] = [
    { id: "wp",    label: "Waypoints" },
    { id: "cfg",   label: "Config" },
    { id: "phy",   label: "Physics" },
    { id: "nepa",  label: "NEPA" },
    { id: "robot", label: "Robot" },
  ];
  return (
    <div
      style={{
        background: "#0f1419",
        border: "1px solid #1a1f26",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", borderBottom: "1px solid #1a1f26", flexShrink: 0, background: "rgba(5,14,26,.4)" }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                height: 36,
                border: "none",
                background: active ? "rgba(79,152,163,.1)" : "transparent",
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? "#5ab8d0" : "#8b9aae",
                cursor: "pointer",
                borderBottom: active ? "2px solid #4f98a3" : "2px solid transparent",
                transition: "all .14s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, color: "#cfd8e3", fontSize: 11.5, minHeight: 0 }}>
        {tab === "wp"    && <WaypointsTab />}
        {tab === "cfg"   && <ConfigTab />}
        {tab === "phy"   && <PhysicsTab />}
        {tab === "nepa"  && <NepaTab />}
        {tab === "robot" && <RobotTab />}
      </div>
    </div>
  );
}
