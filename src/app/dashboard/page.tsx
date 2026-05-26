"use client";

import Link from "next/link";
import { Card, Badge } from "./_components/SpecCard";
import { FLEET, OPS_KPIS, type DroneStatus } from "@/lib/mock/ops";
import AlertsPanel from "./_components/AlertsPanel";
import ActivityPanel from "./_components/ActivityPanel";

const STATUS_COLOR: Record<DroneStatus, string> = {
  active:  "#22c55e",
  rth:     "#3b82f6",
  warn:    "#f59e0b",
  offline: "#ef4444",
  standby: "#8b9aae",
};

const STATUS_LABEL: Record<DroneStatus, string> = {
  active:  "Active",
  rth:     "RTH",
  warn:    "Low Bat",
  offline: "Offline",
  standby: "Standby",
};

export default function OperationalDashboardPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Fleet Management</h1>
          <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>Live Registry - 7 drones, 4 active</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={btnG}>Export CSV</button>
          <Link href="/dashboard/world-model" style={{ ...btnT, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Open World Model
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {OPS_KPIS.map((k) => {
          const content = (
            <div style={{ padding: 12, background: "linear-gradient(180deg, rgba(218,226,236,.06) 0%, rgba(202,213,224,.03) 100%)", border: "1px solid #1a1f26", borderRadius: 11 }}>
              <div style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#e0e8f2", fontFamily: "ui-monospace, monospace", margin: "4px 0 6px" }}>{k.value}</div>
              <Badge kind={k.badgeKind}>{k.badge}</Badge>
            </div>
          );
          return k.href ? (
            <Link key={k.label} href={k.href} style={{ textDecoration: "none" }}>
              {content}
            </Link>
          ) : (
            <div key={k.label}>{content}</div>
          );
        })}
      </div>

      {/* Fleet table */}
      <Card title="Drone Registry">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Drone ID","Model","Status","NERM","Battery","Location","Mission","Hours","Next Service","Actions"].map((h) => (
                  <th key={h} style={{ background: "rgba(59,93,141,.1)", color: "#8b9aae", fontWeight: 600, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", padding: "7px 10px", textAlign: "left", borderBottom: "1px solid #1a1f26", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLEET.map((d) => {
                const color = STATUS_COLOR[d.status];
                const batColor = d.bat > 50 ? "#22c55e" : d.bat > 20 ? "#f59e0b" : "#ef4444";
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid rgba(26,31,38,.6)" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: "#e0e8f2", fontSize: 11.5 }}>{d.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#cfd8e3" }}>{d.model}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: color + "22", color, border: "1px solid " + color + "44" }}>
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace", color: "#5ab8d0", fontSize: 10.5 }}>{d.nerm}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 46, height: 5, background: "rgba(79,152,163,.15)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: d.bat + "%", height: "100%", background: batColor, borderRadius: 999 }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: "#cfd8e3" }}>{d.bat}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#cfd8e3" }}>{d.loc}</td>
                    <td style={{ padding: "8px 10px", color: "#cfd8e3" }}>{d.mission}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace", color: "#cfd8e3" }}>{d.hours}h</td>
                    <td style={{ padding: "8px 10px", color: "#8b9aae" }}>{d.svc}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={btnSm}>Open</button>
                        <button style={btnSmW}>RTH</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom row: Alerts + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <AlertsPanel />
        <ActivityPanel />
      </div>
    </main>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 12px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "none" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnSm: React.CSSProperties = { padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid #1a1f26", background: "rgba(255,255,255,.05)", color: "#cfd8e3" };
const btnSmW: React.CSSProperties = { ...btnSm, background: "rgba(180,83,9,.14)", border: "1px solid rgba(180,83,9,.3)", color: "#fcd34d" };
