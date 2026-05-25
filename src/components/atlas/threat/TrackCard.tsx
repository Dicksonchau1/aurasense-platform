import React from "react"
import type { ThreatTrack } from "../../../types/atlas-threat"

const SENSOR_COLORS: Record<string, string> = {
  event_camera: "#d946ef",
  radar_primary: "#22d3ee",
  radar_secondary: "rgba(34,211,238,0.7)",
  adsb: "#60a5fa",
  ais: "#2dd4bf",
  seismic: "#facc15",
  acoustic: "#fb923c",
  rf_spectrum: "#f87171"
}

const STATE_COLORS: Record<string, string> = {
  nominal: "#484f58",
  detected: "#22d3ee",
  classified: "#a78bfa",
  tracked: "#f59e0b",
  engaged: "#f85149",
  resolved: "#3fb950"
}

export default function TrackCard({ track, flash, onAdvance, onEngage, engaging }: {
  track: ThreatTrack
  flash?: boolean
  onAdvance?: (to: string) => void
  onEngage?: () => void
  engaging?: boolean
}) {
  return (
    <div
      style={{
        border: `2px solid ${flash ? "#22d3ee" : "var(--border)"}`,
        boxShadow: flash ? "0 0 12px rgba(34,211,238,0.4)" : undefined,
        borderRadius: 12,
        background: "var(--bg-surface)",
        marginBottom: 18,
        padding: 18,
        minWidth: 340,
        maxWidth: 420,
        transition: "border-color 0.3s, box-shadow 0.3s"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ background: STATE_COLORS[track.threat_state], color: "#fff", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>{track.threat_state.toUpperCase()}</span>
        <span style={{ color: "#484f58", fontFamily: "monospace", fontSize: 13 }}>{track.id.slice(-8)}</span>
      </div>
      <div style={{ fontWeight: 600, marginTop: 8 }}>{track.classification || "-"} {track.formation_geometry ? `· ${track.formation_geometry}` : ""}</div>
      {/* Sensor dots */}
      <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
        {["event_camera","radar_primary","radar_secondary","adsb","ais","seismic","acoustic","rf_spectrum"].map((s, i) => (
          <span key={s} style={{
            width: 14, height: 14, borderRadius: 7,
            background: track.sources.includes(s as any) ? SENSOR_COLORS[s] : "#484f58",
            display: "inline-block"
          }} />
        ))}
      </div>
      {/* Confidence bar */}
      <div style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#222" }}>
          <div style={{
            height: 10,
            borderRadius: 5,
            width: `${Math.round(track.confidence * 100)}%`,
            background: track.confidence >= 0.7 ? "#3fb950" : track.confidence >= 0.4 ? "#f59e0b" : "#f85149",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)"
          }} />
        </div>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>{Math.round(track.confidence * 100)}%</span>
      </div>
      <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
        {track.lat?.toFixed(4)}°N {track.lng?.toFixed(4)}°E
        {track.altitude_m ? ` · ${track.altitude_m}m` : ""}
        {track.bearing_deg ? ` · ${track.bearing_deg}°` : ""}
        {track.speed_mps ? ` · ${track.speed_mps}m/s` : ""}
      </div>
      <div style={{ color: "#22d3ee", fontSize: 13, marginBottom: 6 }}>
        [fence: {track.sovereignty_fence.jurisdiction} / {track.sovereignty_fence.classification}]
      </div>
      {/* Behavioural signals */}
      {track.behavioural_signals && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {Object.entries(track.behavioural_signals).map(([k, v]) => (
            <span key={k} style={{
              background: v ? "rgba(249,115,22,0.15)" : "transparent",
              border: `1px solid ${v ? "#f97316" : "#484f58"}`,
              color: v ? "#f97316" : "#484f58",
              borderRadius: 6,
              fontSize: 11,
              padding: "1px 6px"
            }}>{k.replace(/_/g, "-")}</span>
          ))}
        </div>
      )}
      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {track.threat_state === "detected" && (
          <button onClick={() => onAdvance && onAdvance("classified")}
            style={actionBtnStyle}>→ CLASSIFY</button>
        )}
        {track.threat_state === "classified" && (
          <button onClick={() => onAdvance && onAdvance("tracked")}
            style={actionBtnStyle}>→ TRACK</button>
        )}
        {track.threat_state === "tracked" && (
          <button onClick={onEngage} disabled={engaging}
            style={{ ...actionBtnStyle, background: "#22d3ee", color: "#fff" }}>{engaging ? "..." : "⚡ ENGAGE"}</button>
        )}
        {track.threat_state === "engaged" && (
          <button onClick={() => onAdvance && onAdvance("resolved")}
            style={{ ...actionBtnStyle, background: "#3fb950", color: "#fff" }}>✓ RESOLVE</button>
        )}
      </div>
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  background: "#111418",
  color: "#22d3ee",
  border: "1px solid #22d3ee",
  borderRadius: 6,
  padding: "4px 14px",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer"
}
