"use client";

import { useMission } from "@/lib/mission/context";
import { calcDist } from "@/lib/mission/wpEngine";

export default function WaypointsTab() {
  const m = useMission();
  const dist = Math.round(calcDist(m.wps));
  const tm = m.cfg.spd > 0 ? Math.round(dist / m.cfg.spd) : 0;
  const bat = Math.min(99, Math.round((tm / 60 / 41) * 60 + 5));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#e0e8f2" }}>Waypoints</div>
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(79,152,163,.15)", color: "#5ab8d0", border: "1px solid rgba(79,152,163,.3)" }}>
          {m.wps.length}
        </span>
      </div>

      {m.wps.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#6b7a8c", fontSize: 11, border: "1px dashed #1a1f26", borderRadius: 8 }}>
          Click the 3D viewport to drop waypoints.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
          {m.wps.map((w, i) => {
            const active = i === m.selectedWP;
            return (
              <div
                key={i}
                onClick={() => m.selectWP(active ? -1 : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: active ? "rgba(79,152,163,.18)" : "rgba(255,255,255,.03)",
                  border: "1px solid " + (active ? "rgba(79,152,163,.45)" : "#1a1f26"),
                  cursor: "pointer",
                  fontSize: 11,
                  transition: "background .14s",
                }}
              >
                <span
                  style={{
                    width: 20, height: 20,
                    borderRadius: "50%",
                    background: w.type === "home" ? "#22c55e" : "#4f98a3",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    fontFamily: "ui-monospace, monospace",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {w.type === "home" ? "H" : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "#cfd8e3" }}>
                    {w.type === "home" ? "HOME" : "WP-" + String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 9.5, color: "#6b7a8c", fontFamily: "ui-monospace, monospace" }}>
                    {w.x.toFixed(1)}, {w.y.toFixed(1)}, {w.z.toFixed(1)}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); m.removeWP(i); }}
                  style={{ background: "transparent", border: "none", color: "#6b7a8c", cursor: "pointer", fontSize: 13, padding: "2px 5px" }}
                  title="Remove"
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 1, background: "#1a1f26" }} />

      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>Route</div>
      <StatRow label="Waypoints"   value={m.wps.length} />
      <StatRow label="Distance"    value={dist ? dist + " m" : "--"} />
      <StatRow label="Flight time" value={tm ? Math.floor(tm / 60) + "m " + (tm % 60) + "s" : "--"} />
      <StatRow label="Battery"     value={dist ? bat + "%" : "--"} />
      <StatRow label="Coverage"    value={dist ? Math.round(dist / m.cfg.so * 0.9) + " m^2" : "--"} />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 11.5 }}>
      <span style={{ color: "#8b9aae" }}>{label}</span>
      <span style={{ color: "#e0e8f2", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
