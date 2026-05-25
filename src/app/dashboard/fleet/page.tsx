'use client';

import { useState, useMemo } from "react";
import Link from "next/link";

type AssetType = "drone" | "robot" | "agent";
type AssetState = "active" | "idle" | "charging" | "fault" | "offline";

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  model: string;
  state: AssetState;
  battery: number;
  signal: number;
  location: string;
  mission: string | null;
  flights_30d: number;
  last_seen: string;
  nerm: "ok" | "warn" | "fail";
}

const FLEET: Asset[] = [
  { id: "DRN-12", name: "Falcon-12", type: "drone", model: "AS-Aurora MK3", state: "active",   battery: 82, signal: 96, location: "MTR Kwun Tong T3",      mission: "MSN-007", flights_30d: 42, last_seen: "live",        nerm: "ok"   },
  { id: "DRN-07", name: "Falcon-07", type: "drone", model: "AS-Aurora MK3", state: "idle",     battery: 91, signal: 88, location: "ArchSD Block A bay",    mission: null,      flights_30d: 38, last_seen: "12 min ago",  nerm: "ok"   },
  { id: "DRN-03", name: "Falcon-03", type: "drone", model: "AS-Aurora MK2", state: "charging", battery: 47, signal: 99, location: "CLP substation 12 dock", mission: null,      flights_30d: 51, last_seen: "live",        nerm: "ok"   },
  { id: "DRN-09", name: "Falcon-09", type: "drone", model: "AS-Aurora MK3", state: "idle",     battery: 88, signal: 92, location: "ArchSD Block B bay",    mission: null,      flights_30d: 29, last_seen: "4 min ago",   nerm: "ok"   },
  { id: "DRN-04", name: "Falcon-04", type: "drone", model: "AS-Aurora MK3", state: "idle",     battery: 95, signal: 94, location: "ArchSD Block C bay",    mission: "MSN-008", flights_30d: 33, last_seen: "live",        nerm: "ok"   },
  { id: "DRN-11", name: "Falcon-11", type: "drone", model: "AS-Aurora MK2", state: "fault",    battery: 12, signal: 32, location: "CLP pipeline 04N",       mission: null,      flights_30d: 17, last_seen: "2 hr ago",    nerm: "fail" },
  { id: "ROB-02", name: "Tendon-02",  type: "robot", model: "AS-Humanoid R1", state: "active",  battery: 71, signal: 100, location: "HA Princess Margaret",  mission: "MSN-RH-14", flights_30d: 12, last_seen: "live",      nerm: "ok"   },
  { id: "AGT-01", name: "Atlas-Mind", type: "agent", model: "NEPA v2.4",     state: "active",  battery: 100, signal: 100, location: "edge / Jetson Orin",   mission: "supervising MSN-007", flights_30d: 0, last_seen: "live", nerm: "ok" },
];

const STATE_STYLE: Record<AssetState, { bg: string; fg: string; dot: string; label: string }> = {
  active:   { bg: "#065f46", fg: "#a7f3d0", dot: "#10b981", label: "Active"   },
  idle:     { bg: "#1f2937", fg: "#9ca3af", dot: "#6b7280", label: "Idle"     },
  charging: { bg: "#1e3a8a", fg: "#bfdbfe", dot: "#3b82f6", label: "Charging" },
  fault:    { bg: "#7f1d1d", fg: "#fecaca", dot: "#ef4444", label: "Fault"    },
  offline:  { bg: "#374151", fg: "#9ca3af", dot: "#4b5563", label: "Offline"  },
};

const TYPE_LABEL: Record<AssetType, string> = { drone: "Drone", robot: "Robot", agent: "Agent" };

function batteryColor(pct: number): string {
  if (pct < 20) return "#ef4444";
  if (pct < 50) return "#f59e0b";
  return "#10b981";
}

export default function FleetPage() {
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [selected, setSelected] = useState<Asset | null>(FLEET[0]);

  const filtered = useMemo(
    () => typeFilter === "all" ? FLEET : FLEET.filter(a => a.type === typeFilter),
    [typeFilter]
  );

  const stats = useMemo(() => ({
    total:    FLEET.length,
    active:   FLEET.filter(a => a.state === "active").length,
    idle:     FLEET.filter(a => a.state === "idle").length,
    charging: FLEET.filter(a => a.state === "charging").length,
    fault:    FLEET.filter(a => a.state === "fault").length,
    drones:   FLEET.filter(a => a.type === "drone").length,
    robots:   FLEET.filter(a => a.type === "robot").length,
    agents:   FLEET.filter(a => a.type === "agent").length,
  }), []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0e15", color: "#e5e7eb", fontFamily: "system-ui", padding: "32px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, borderBottom: "1px solid #1f2937", paddingBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 8px", color: "#374151" }}>/</span>
            <span>Fleet</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Fleet</h1>
          <p style={{ color: "#9ca3af", marginTop: 6, fontSize: 14 }}>Live status of every drone, robot, and agent enrolled on the ATLAS substrate.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "9px 14px", background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Enroll asset</button>
          <button style={{ padding: "9px 14px", background: "#22d3ee", color: "#0a0e15", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Recall all</button>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        {[["Total",stats.total,"#22d3ee"],["Active",stats.active,"#10b981"],["Idle",stats.idle,"#9ca3af"],["Charging",stats.charging,"#3b82f6"],["Fault",stats.fault, stats.fault > 0 ? "#ef4444" : "#9ca3af"]].map(([label, val, color], i) => (
          <div key={i} style={{ padding: "14px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label as string}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: color as string }}>{val as number}</div>
          </div>
        ))}
      </section>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, padding: 4, background: "#111827", border: "1px solid #1f2937", borderRadius: 8, width: "fit-content" }}>
        {(["all", "drone", "robot", "agent"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t as any)}
            style={{ padding: "6px 14px", background: typeFilter === t ? "#22d3ee" : "transparent", color: typeFilter === t ? "#0a0e15" : "#9ca3af", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {t === "all" ? "All" : t + "s"}
          </button>
        ))}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "#111827", borderRadius: 10, border: "1px solid #1f2937", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Assets ({filtered.length})</h2>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Click to inspect</span>
          </div>
          <div style={{ overflow: "auto", maxHeight: 540 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "#0a0e15", position: "sticky", top: 0 }}>
                <tr>
                  {["ID", "Name", "Type", "State", "Battery", "Signal", "Mission", "Last seen"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #1f2937" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const st = STATE_STYLE[a.state];
                  const isSel = selected?.id === a.id;
                  return (
                    <tr key={a.id} onClick={() => setSelected(a)}
                      style={{ cursor: "pointer", background: isSel ? "#1f2937" : "transparent", borderBottom: "1px solid #1f2937" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, monospace", color: "#22d3ee" }}>{a.id}</td>
                      <td style={{ padding: "10px 12px" }}>{a.name}</td>
                      <td style={{ padding: "10px 12px", color: "#9ca3af", textTransform: "capitalize" }}>{a.type}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: st.bg, color: st.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 5, background: st.dot, display: "inline-block" }} />
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 50, height: 6, background: "#0a0e15", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: a.battery + "%", height: "100%", background: batteryColor(a.battery) }} />
                          </div>
                          <span style={{ fontFamily: "ui-monospace, monospace", color: batteryColor(a.battery), fontSize: 12 }}>{a.battery}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, monospace", color: a.signal > 60 ? "#10b981" : a.signal > 30 ? "#f59e0b" : "#ef4444" }}>{a.signal}%</td>
                      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, monospace", color: a.mission ? "#a7f3d0" : "#4b5563", fontSize: 12 }}>{a.mission ?? "—"}</td>
                      <td style={{ padding: "10px 12px", color: a.last_seen === "live" ? "#10b981" : "#9ca3af", fontSize: 12 }}>{a.last_seen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside style={{ background: "#111827", borderRadius: 10, border: "1px solid #1f2937", padding: 20 }}>
          {selected ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#22d3ee" }}>{selected.id}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: "4px 0 0 0" }}>{selected.name}</h3>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, textTransform: "capitalize" }}>{selected.type} · {selected.model}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: STATE_STYLE[selected.state].bg, color: STATE_STYLE[selected.state].fg, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: STATE_STYLE[selected.state].dot, display: "inline-block" }} />
                  {STATE_STYLE[selected.state].label}
                </span>
              </div>

              <div style={{ background: "#0a0e15", border: "1px dashed #1f2937", borderRadius: 8, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "#4b5563", fontSize: 13 }}>
                3D asset visualization
              </div>

              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0, fontSize: 13 }}>
                <dt style={{ color: "#6b7280" }}>Location</dt><dd style={{ margin: 0 }}>{selected.location}</dd>
                <dt style={{ color: "#6b7280" }}>Mission</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace", color: selected.mission ? "#a7f3d0" : "#6b7280" }}>{selected.mission ?? "none"}</dd>
                <dt style={{ color: "#6b7280" }}>Battery</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace", color: batteryColor(selected.battery) }}>{selected.battery}%</dd>
                <dt style={{ color: "#6b7280" }}>Signal</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>{selected.signal}%</dd>
                <dt style={{ color: "#6b7280" }}>NERM</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace", color: selected.nerm === "ok" ? "#10b981" : selected.nerm === "warn" ? "#f59e0b" : "#ef4444", textTransform: "uppercase" }}>{selected.nerm}</dd>
                <dt style={{ color: "#6b7280" }}>Flights (30d)</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>{selected.flights_30d}</dd>
                <dt style={{ color: "#6b7280" }}>Last seen</dt><dd style={{ margin: 0, color: selected.last_seen === "live" ? "#10b981" : "#9ca3af" }}>{selected.last_seen}</dd>
              </dl>

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button style={{ flex: 1, padding: "9px 12px", background: "#22d3ee", color: "#0a0e15", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Recall</button>
                <button style={{ flex: 1, padding: "9px 12px", background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Land</button>
                <button style={{ flex: 1, padding: "9px 12px", background: "#7f1d1d", color: "#fecaca", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Emergency</button>
              </div>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #1f2937", fontSize: 12, color: "#6b7280" }}>
                Asset enrolled on ATLAS substrate. All commands signed and logged to evidence chain.
              </div>
            </>
          ) : (
            <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 0", fontSize: 13 }}>Select an asset to inspect</div>
          )}
        </aside>
      </section>
    </main>
  );
}
