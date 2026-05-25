'use client';

import { useState, useMemo } from "react";
import Link from "next/link";

type Status = "planned" | "active" | "complete" | "aborted";

interface Mission {
  id: string;
  name: string;
  site: string;
  skill: string;
  status: Status;
  drone: string;
  start: string;
  end: string | null;
  waypoints: number;
  duration_min: number;
}

const SEED_MISSIONS: Mission[] = [
  { id: "MSN-007", name: "Confined-space tunnel inspection",  site: "MTR Kwun Tong T3",   skill: "confined-space-inspection-v1", status: "active",   drone: "DRN-12", start: "2026-05-26T02:15:00Z", end: null,                       waypoints: 34, duration_min: 42 },
  { id: "MSN-006", name: "Facade defect scan — south block",  site: "ArchSD Block A",     skill: "humid-region-facade-v1",        status: "complete", drone: "DRN-07", start: "2026-05-25T09:00:00Z", end: "2026-05-25T09:42:00Z",     waypoints: 28, duration_min: 42 },
  { id: "MSN-005", name: "Perimeter sweep — sector 4",        site: "CLP substation 12",  skill: "perimeter-sweep-v2",            status: "complete", drone: "DRN-03", start: "2026-05-25T07:30:00Z", end: "2026-05-25T08:14:00Z",     waypoints: 41, duration_min: 44 },
  { id: "MSN-004", name: "Roof anomaly verification",         site: "ArchSD Block B",     skill: "thermal-anomaly-v1",            status: "complete", drone: "DRN-09", start: "2026-05-24T14:00:00Z", end: "2026-05-24T14:31:00Z",     waypoints: 19, duration_min: 31 },
  { id: "MSN-008", name: "Pre-deploy rehearsal — Block C",    site: "ArchSD Block C",     skill: "humid-region-facade-v1",        status: "planned",  drone: "DRN-04", start: "2026-05-26T08:00:00Z", end: null,                       waypoints: 32, duration_min: 38 },
  { id: "MSN-003", name: "Pipeline thermal walk",             site: "CLP pipeline 04N",   skill: "thermal-anomaly-v1",            status: "aborted",  drone: "DRN-11", start: "2026-05-23T11:00:00Z", end: "2026-05-23T11:08:00Z",     waypoints: 22, duration_min: 8  },
];

const STATUS_STYLE: Record<Status, { bg: string; fg: string; label: string }> = {
  planned:  { bg: "#1e3a8a", fg: "#bfdbfe", label: "Planned"  },
  active:   { bg: "#065f46", fg: "#a7f3d0", label: "Active"   },
  complete: { bg: "#1f2937", fg: "#9ca3af", label: "Complete" },
  aborted:  { bg: "#7f1d1d", fg: "#fecaca", label: "Aborted"  },
};

export default function MissionPlannerPage() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Mission | null>(SEED_MISSIONS[0]);

  const filtered = useMemo(
    () => filter === "all" ? SEED_MISSIONS : SEED_MISSIONS.filter(m => m.status === filter),
    [filter]
  );

  const counts = useMemo(() => ({
    all:      SEED_MISSIONS.length,
    planned:  SEED_MISSIONS.filter(m => m.status === "planned").length,
    active:   SEED_MISSIONS.filter(m => m.status === "active").length,
    complete: SEED_MISSIONS.filter(m => m.status === "complete").length,
    aborted:  SEED_MISSIONS.filter(m => m.status === "aborted").length,
  }), []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0e15", color: "#e5e7eb", fontFamily: "system-ui", padding: "32px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, borderBottom: "1px solid #1f2937", paddingBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 8px", color: "#374151" }}>/</span>
            <span>Mission Planner</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Mission Planner</h1>
          <p style={{ color: "#9ca3af", marginTop: 6, fontSize: 14 }}>Plan, rehearse, and dispatch ATLAS missions against site envelopes.</p>
        </div>
        <button style={{ padding: "10px 18px", background: "#22d3ee", color: "#0a0e15", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          + New Mission
        </button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {([["all","Total"], ["planned","Planned"], ["active","Active"], ["complete","Complete"], ["aborted","Aborted"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key as any)}
            style={{ textAlign: "left", padding: "14px 16px", background: filter === key ? "#1f2937" : "#111827", border: filter === key ? "1px solid #22d3ee" : "1px solid #1f2937", borderRadius: 8, cursor: "pointer", color: "inherit" }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{counts[key]}</div>
          </button>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div style={{ background: "#111827", borderRadius: 10, border: "1px solid #1f2937", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Missions ({filtered.length})</h2>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Click to inspect</span>
          </div>
          <div style={{ overflow: "auto", maxHeight: 540 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "#0a0e15", position: "sticky", top: 0 }}>
                <tr>
                  {["ID", "Name", "Site", "Status", "Drone", "Waypoints"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #1f2937" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const st = STATUS_STYLE[m.status];
                  const isSel = selected?.id === m.id;
                  return (
                    <tr key={m.id} onClick={() => setSelected(m)}
                      style={{ cursor: "pointer", background: isSel ? "#1f2937" : "transparent", borderBottom: "1px solid #1f2937" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, monospace", color: "#22d3ee" }}>{m.id}</td>
                      <td style={{ padding: "10px 12px" }}>{m.name}</td>
                      <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{m.site}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: st.bg, color: st.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, monospace", color: "#d1d5db" }}>{m.drone}</td>
                      <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{m.waypoints}</td>
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
                </div>
                <span style={{ background: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].fg, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  {STATUS_STYLE[selected.status].label}
                </span>
              </div>

              <div style={{ background: "#0a0e15", border: "1px dashed #1f2937", borderRadius: 8, height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "#4b5563", fontSize: 13 }}>
                3D waypoint preview — {selected.waypoints} waypoints
              </div>

              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0, fontSize: 13 }}>
                <dt style={{ color: "#6b7280" }}>Site</dt><dd style={{ margin: 0 }}>{selected.site}</dd>
                <dt style={{ color: "#6b7280" }}>Skill</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace", color: "#a7f3d0" }}>{selected.skill}</dd>
                <dt style={{ color: "#6b7280" }}>Drone</dt><dd style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>{selected.drone}</dd>
                <dt style={{ color: "#6b7280" }}>Start</dt><dd style={{ margin: 0 }}>{new Date(selected.start).toLocaleString()}</dd>
                <dt style={{ color: "#6b7280" }}>End</dt><dd style={{ margin: 0 }}>{selected.end ? new Date(selected.end).toLocaleString() : "—"}</dd>
                <dt style={{ color: "#6b7280" }}>Duration</dt><dd style={{ margin: 0 }}>{selected.duration_min} min</dd>
              </dl>

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button style={{ flex: 1, padding: "9px 12px", background: "#22d3ee", color: "#0a0e15", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Rehearse</button>
                <button style={{ flex: 1, padding: "9px 12px", background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Dispatch</button>
              </div>
            </>
          ) : (
            <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 0", fontSize: 13 }}>Select a mission to inspect</div>
          )}
        </aside>
      </section>
    </main>
  );
}
