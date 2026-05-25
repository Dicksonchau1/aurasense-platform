import React from "react"
import type { EngagementAuthorityToken } from "../../../types/atlas-threat"

export default function EngagementAuthorityLog({ log, tokenCountdowns }: {
  log: EngagementAuthorityToken[]
  tokenCountdowns: Map<string, number>
}) {
  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: 12, height: 128 }}>
      {log.map(token => {
        const countdown = tokenCountdowns.get(token.track_id) ?? 0
        let badgeColor = "#3fb950"
        let blink = false
        if (countdown <= 10 && countdown > 0) { badgeColor = "#f85149"; blink = true }
        else if (countdown <= 30) badgeColor = "#f59e0b"
        else if (countdown <= 0) badgeColor = "#484f58"
        return (
          <div key={token.audit_id} style={{ minWidth: 180, maxWidth: 200, background: "#161b22", borderRadius: 10, padding: 12, border: `2px solid ${badgeColor}` }}>
            <div style={{ fontWeight: 700, color: "#22d3ee", marginBottom: 4 }}>{token.track_id}</div>
            <div style={{ color: "#a78bfa", fontSize: 13, marginBottom: 2 }}>{token.sovereignty_fence}</div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 2 }}>audit: {token.audit_id.slice(0,8)}</div>
            <div style={{ color: "#f59e0b", fontSize: 12, marginBottom: 2 }}>MAVLINK · 0x{(token.command_frame||"").replace(/ /g,"").slice(0,8)}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                background: badgeColor,
                color: "#fff",
                borderRadius: 6,
                padding: "2px 10px",
                fontWeight: 700,
                fontSize: 13,
                animation: blink ? "countdownBlink 1s step-end infinite" : undefined
              }}>
                {countdown > 0 ? `${countdown}s` : "EXPIRED"}
              </span>
            </div>
          </div>
        )
      })}
      <style>{`
        @keyframes countdownBlink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
