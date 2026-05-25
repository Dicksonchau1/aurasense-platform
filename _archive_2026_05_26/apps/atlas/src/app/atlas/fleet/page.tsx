"use client"
import React, { useEffect, useState } from "react"
import { Plane, Truck, Ship, Radio, Factory } from "lucide-react"
import { FleetUnit } from "../../../types/atlas"

type Domain = keyof typeof DOMAIN_LABELS;

const DOMAIN_LABELS = {
  aerial: { icon: Plane, color: "#22d3ee" },
  ground: { icon: Truck, color: "#a78bfa" },
  maritime: { icon: Ship, color: "#2dd4bf" },
  sensor: { icon: Radio, color: "#f59e0b" },
  industrial: { icon: Factory, color: "#fb923c" },
}

const STATUS_LABELS = [
  "all",
  "active",
  "in_mission",
  "idle",
  "alert",
  "offline",
  "unverified",
]

function relTime(ts: string | number) {
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts
  const d = Math.floor((Date.now() - t) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  return `${Math.floor(d / 3600)}h ago`
}

export default function FleetMonitorPage() {
  const [units, setUnits] = useState<FleetUnit[]>([])
  const [selected, setSelected] = useState<FleetUnit | null>(null)
  const [domainFilter, setDomainFilter] = useState<FleetUnit["domain"] | "all">("all")
  const [statusFilter, setStatusFilter] = useState<any>("all")
  const [relativeNow, setRelativeNow] = useState(Date.now())

  useEffect(() => {
    const poll = () => fetch("/api/registry/drones").then(r => r.json()).then(j => setUnits(j.data?.units ?? []))
    poll()
    const id = setInterval(poll, 5000)
    const relId = setInterval(() => setRelativeNow(Date.now()), 10000)
    return () => { clearInterval(id); clearInterval(relId) }
  }, [])

  const filtered = units.filter(u =>
    (domainFilter === "all" || u.domain === domainFilter) &&
    (statusFilter === "all" || u.status === statusFilter)
  )

  // Battery bar color
  function batteryColor(pct: number | null) {
    if (pct == null) return "#484f58"
    if (pct > 70) return "#3fb950"
    if (pct > 40) return "#f59e0b"
    return "#f85149"
  }

  // Status LED color
  function statusLed(status: string) {
    switch (status) {
      case "active": return "#3fb950"
      case "in_mission": return "#22d3ee"
      case "idle": return "#f59e0b"
      case "alert": return "#f85149"
      case "offline": return "#484f58"
      case "unverified": return "#d946ef"
      default: return "#484f58"
    }
  }

  // Fleet summary
  const total = units.length
  const inMission = units.filter(u => u.status === "in_mission").length
  const offline = units.filter(u => u.status === "offline").length
  const batteryVals = units.map(u => u.battery_pct).filter(x => x != null) as number[]
  const avgBattery = batteryVals.length ? Math.round(batteryVals.reduce((a, b) => a + b, 0) / batteryVals.length) : null

  // Tactical map helpers
  const toX = (lng: number) => ((lng - 113.83) / (114.42 - 113.83)) * 380 + 10
  const toY = (lat: number) => ((22.55 - lat) / (22.55 - 22.18)) * 260 + 10

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", height: "100vh", background: "#000" }}>
      {/* Left Column: Filters + List */}
      <div style={{ borderRight: "1px solid #1f2937", padding: 0, overflow: "hidden", background: "#0d1117" }}>
        <div style={{ display: "flex", gap: 4, padding: 8 }}>
          {["all", "aerial", "ground", "maritime", "sensor", "industrial"].map(dom => {
            const active = domainFilter === dom
            const color = dom !== "all" ? (DOMAIN_LABELS as any)[dom]?.color : undefined
            return (
              <button key={dom} onClick={() => setDomainFilter(dom as any)}
                style={{
                  background: active ? "rgba(34,211,238,0.12)" : undefined,
                  borderBottom: active ? `2px solid #22d3ee` : undefined,
                  color: active ? "#22d3ee" : color || "#484f58",
                  fontWeight: active ? 700 : 500,
                  flex: 1,
                  fontSize: 13,
                  padding: 6,
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  borderRadius: 0,
                  transition: "all 0.15s"
                }}>{dom.toUpperCase()}</button>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 4, padding: 8 }}>
          {STATUS_LABELS.map(st => {
            const active = statusFilter === st
            return (
              <button key={st} onClick={() => setStatusFilter(st)}
                style={{
                  background: active ? "rgba(34,211,238,0.12)" : undefined,
                  color: active ? "#22d3ee" : "#484f58",
                  fontWeight: active ? 700 : 500,
                  fontSize: 12,
                  padding: "4px 8px",
                  border: "none",
                  outline: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}>{st.replace("_", " ").toUpperCase()}</button>
            )
          })}
        </div>
        {/* Fleet summary strip */}
        <div style={{ display: "flex", gap: 4, padding: 8, fontSize: 12, color: "#cbd5e1" }}>
          <div style={{ flex: 1 }}>TOTAL <b>{total}</b></div>
          <div style={{ flex: 1 }}>IN_MISSION <b>{inMission}</b></div>
          <div style={{ flex: 1 }}>OFFLINE <b>{offline}</b></div>
        </div>
        <div style={{ padding: 8 }}>
          <div style={{ height: 18, background: "#1f2937", borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <div style={{
              width: avgBattery != null ? `${avgBattery}%` : 0,
              height: "100%",
              background: batteryColor(avgBattery),
              transition: "width 0.5s"
            }} />
            <span style={{ position: "absolute", left: 8, top: 1, fontSize: 11, color: "#cbd5e1", fontFamily: "monospace" }}>
              AVG BATTERY {avgBattery != null ? `${avgBattery}%` : "—"}
            </span>
          </div>
        </div>
        {/* Fleet list */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 180px)", padding: 0 }}>
          {filtered.map(u => {
            const Icon = DOMAIN_LABELS[u.domain]?.icon
            return (
              <div key={u.id} onClick={() => setSelected(u)}
                style={{
                  display: "flex", flexDirection: "row", alignItems: "center", gap: 8,
                  padding: "8px 12px", borderLeft: selected?.id === u.id ? "2px solid #22d3ee" : "2px solid transparent",
                  cursor: "pointer", background: selected?.id === u.id ? "#111827" : undefined,
                  borderBottom: "1px solid #1f2937"
                }}>
                <span>{Icon && <Icon size={16} color={DOMAIN_LABELS[u.domain].color} />}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>{u.id}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{u.model}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{u.mission_id || "—"}</div>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: statusLed(u.status), display: "inline-block", marginRight: 4 }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, color: batteryColor(u.battery_pct), minWidth: 24, textAlign: "right" }}>{u.battery_pct != null ? `${u.battery_pct}%` : "—"}</span>
                <span style={{ fontSize: 10, color: "#64748b", minWidth: 48, textAlign: "right" }}>{relTime(u.last_heartbeat)}</span>
              </div>
            )
          })}
        </div>
      </div>
      {/* Center Column: Detail + Map */}
      <div style={{ padding: 24, overflowY: "auto" }}>
        {selected ? (
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 8, padding: 20, marginBottom: 24, color: "#cbd5e1", maxWidth: 520 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <b>{selected.oem}</b> {selected.model}
              <span style={{ marginLeft: "auto", background: DOMAIN_LABELS[selected.domain].color, color: "#fff", borderRadius: 6, fontSize: 10, padding: "2px 8px" }}>{selected.domain.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={{ background: "#1f2937", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>{selected.status.toUpperCase()}</span>
              <span style={{ background: "#1f2937", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>{selected.capability_class}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>BATTERY</div>
                <div style={{ fontFamily: "monospace", color: batteryColor(selected.battery_pct), fontSize: 14 }}>{selected.battery_pct != null ? `${selected.battery_pct}%` : "—"}</div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>SIGNAL</div>
                <div style={{ fontFamily: "monospace", color: "#22d3ee", fontSize: 14 }}>{selected.signal_strength}%</div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>ALTITUDE</div>
                <div style={{ fontFamily: "monospace", fontSize: 14 }}>{selected.altitude_m != null ? `${selected.altitude_m} m` : "—"}</div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>SPEED</div>
                <div style={{ fontFamily: "monospace", fontSize: 14 }}>{selected.speed_mps != null ? `${selected.speed_mps.toFixed(1)} m/s` : "—"}</div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>HEADING</div>
                <div style={{ fontFamily: "monospace", fontSize: 14 }}>{selected.heading_deg != null ? `${selected.heading_deg}°` : "—"}</div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>FIRMWARE</div>
                <div style={{ fontFamily: "monospace", fontSize: 14 }}>{selected.firmware_version}</div>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>POSITION</div>
              <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                LAT: {selected.lat != null ? `${selected.lat.toFixed(4)}°N` : "—"}  LNG: {selected.lng != null ? `${selected.lng.toFixed(4)}°E` : "—"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>IP: {selected.ip_address || "—"}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>ACTIVE MISSION</div>
              <div style={{ fontSize: 13 }}>{selected.mission_name || "— NO ACTIVE MISSION"}</div>
              <a href={selected.mission_id ? `/atlas/missions/${selected.mission_id}` : "#"} style={{ color: "#22d3ee", fontSize: 12, textDecoration: "underline" }}>→ OPEN MISSION PLANNER</a>
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>LAST HEARTBEAT: {relTime(selected.last_heartbeat)}</div>
          </div>
        ) : (
          <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 18, fontWeight: 500 }}>
            SELECT AN ASSET FROM THE FLEET LIST
          </div>
        )}
        {/* Tactical Map Stub */}
        <div style={{ marginTop: 16, background: "#030712", borderRadius: 8, border: "1px solid #1f2937", width: 400, height: 280, position: "relative" }}>
          <svg width={400} height={280} style={{ display: "block" }}>
            {/* Grid lines */}
            {[...Array(10)].map((_, i) => (
              <line key={i} x1={i * 40} y1={0} x2={i * 40} y2={280} stroke="rgba(255,255,255,0.03)" />
            ))}
            {[...Array(7)].map((_, i) => (
              <line key={i} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="rgba(255,255,255,0.03)" />
            ))}
            {/* Plot units */}
            {units.filter(u => u.lat != null && u.lng != null).map(u => {
              const x = toX(u.lng!)
              const y = toY(u.lat!)
              const color = DOMAIN_LABELS[u.domain].color
              const isSelected = selected?.id === u.id
              return (
                <g key={u.id}>
                  {isSelected && <circle cx={x} cy={y} r={12} fill={color} opacity={0.18} >
                    <animate attributeName="r" values="12;18;12" dur="1.2s" repeatCount="indefinite" />
                  </circle>}
                  <circle cx={x} cy={y} r={5} fill={color} opacity={u.status === "offline" ? 0.3 : 0.8} />
                </g>
              )
            })}
            {/* Compass rose */}
            <g>
              <line x1={370} y1={30} x2={390} y2={30} stroke="#64748b" strokeWidth={2} />
              <line x1={380} y1={20} x2={380} y2={40} stroke="#64748b" strokeWidth={2} />
              <text x={380} y={16} fill="#64748b" fontSize={12} textAnchor="middle">N</text>
            </g>
          </svg>
          <div style={{ position: "absolute", left: 16, top: 8, color: "#64748b", fontSize: 11, fontWeight: 600 }}>
            TACTICAL OVERVIEW · hk-kln-1 · {units.length} ASSETS
          </div>
        </div>
      </div>
      {/* Right Column: Edge Stream Console stub */}
      <div style={{ background: "#0d1117", borderLeft: "1px solid #1f2937" }}>
        {/* Edge Stream Console will be implemented in Step 8 */}
      </div>
    </div>
  )
}
