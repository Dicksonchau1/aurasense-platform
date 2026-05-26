"use client";

import { useState } from "react";

type TabId = "wp" | "cfg" | "phy" | "nepa" | "robot";

export default function RightPanel() {
  const [tab, setTab] = useState<TabId>("wp");
  const tabs: { id: TabId; label: string }[] = [
    { id: "wp", label: "Waypoints" },
    { id: "cfg", label: "Config" },
    { id: "phy", label: "Physics" },
    { id: "nepa", label: "NEPA" },
    { id: "robot", label: "Robot" },
  ];
  return (
    <div style={{ background: "#111b28", borderLeft: "1px solid rgba(8,145,178,.18)", display: "flex", flexDirection: "column", overflow: "hidden", width: 310 }}>
      <div style={{ display: "flex", borderBottom: "1px solid rgba(8,145,178,.18)", flexShrink: 0, background: "rgba(5,14,26,.5)" }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ flex: 1, height: 36, border: "none", background: active ? "rgba(8,145,178,.08)" : "transparent", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#5ab8d0" : "#7a9ab8", cursor: "pointer", borderBottom: active ? "2px solid #0891b2" : "2px solid transparent", transition: "all .14s" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 10, color: "#d6e4f0", fontSize: 11 }}>
        <div style={{ padding: 20, textAlign: "center", color: "#3a5070" }}>
          Tab content for "{tab}" - lands in M4.
        </div>
      </div>
    </div>
  );
}
