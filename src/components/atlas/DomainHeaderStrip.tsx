import React from "react"
import type { DomainSummary } from "../../../types/atlas-threat"

const STATE_COLORS: Record<string, string> = {
  nominal: "#484f58",
  detected: "#22d3ee",
  classified: "#a78bfa",
  tracked: "#f59e0b",
  engaged: "#f85149",
  resolved: "#3fb950"
}

const DOMAINS: { key: string; label: string }[] = [
  { key: "airspace", label: "AIRSPACE" },
  { key: "ground", label: "GROUND" },
  { key: "maritime", label: "MARITIME" }
]

export default function DomainHeaderStrip({ domainSummaries }: { domainSummaries: DomainSummary[] }) {
  return (
    <div style={{ display: "flex", height: 52, alignItems: "center", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
      {DOMAINS.map((d, i) => {
        const summary = domainSummaries.find(ds => ds.domain === d.key) || {
          domain: d.key,
          track_count: 0,
          highest_state: "nominal",
          has_new_events: false,
          engaged_count: 0
        }
        return (
          <div key={d.key} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, position: "relative" }}>
            <span style={{ fontWeight: 700, color: "#f5f5f5", fontSize: 15 }}>{d.label}</span>
            <span style={{ background: "#222", color: "#22d3ee", borderRadius: 8, padding: "2px 8px", fontSize: 13, marginLeft: 8 }}>{summary.track_count}</span>
            <span style={{ background: STATE_COLORS[summary.highest_state], color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 13, marginLeft: 8 }}>{summary.highest_state.toUpperCase()}</span>
            {summary.has_new_events && (
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#22d3ee", marginLeft: 8, animation: "blink 1s step-end infinite" }} />
            )}
            {summary.engaged_count > 0 && (
              <span style={{ background: "#f85149", color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 13, marginLeft: 8 }}>{summary.engaged_count}</span>
            )}
          </div>
        )
      })}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
