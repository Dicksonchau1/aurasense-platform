import React from "react"
import type { RegistryAsset } from "../../../types/atlas"

const STATUS_COLORS: Record<string, string> = {
  active: "#3fb950",
  idle: "#f59e0b",
  alert: "#f85149",
  offline: "#484f58",
  unverified: "#a78bfa",
  in_mission: "#2dd4bf"
}

export default function AssetCard({ asset, onEdit, onRevoke }: { asset: RegistryAsset, onEdit?: () => void, onRevoke?: () => void }) {
  return (
    <div style={{
      border: `2px solid var(--border)`,
      borderRadius: 12,
      background: "#161b22",
      padding: 16,
      minWidth: 260,
      maxWidth: 320,
      marginBottom: 18,
      position: "relative"
    }}>
      {/* Status LED */}
      <span style={{
        position: "absolute", top: 14, right: 14,
        width: 12, height: 12, borderRadius: 6,
        background: STATUS_COLORS[asset.status] || "#484f58",
        boxShadow: asset.status === "active" ? "0 0 8px #3fb950" : undefined,
        border: "2px solid #222"
      }} />
      <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 16 }}>{asset.id}</div>
      <div style={{ color: "#a78bfa", fontSize: 13 }}>{asset.oem} · {asset.model}</div>
      <div style={{ color: "#9ca3af", fontSize: 12, margin: "6px 0" }}>{asset.capability_class} · {asset.command_protocol}</div>
      <div style={{ color: "#22d3ee", fontSize: 12 }}>[{asset.sovereignty_fence.jurisdiction}]</div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
        Battery: {asset.battery_pct ?? "-"}%
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
        Status: {asset.status}
      </div>
      {asset.oem_integration_verified && (
        <div style={{ marginTop: 8, color: "#3fb950", fontSize: 12, fontWeight: 600 }}>OEM VERIFIED ✓</div>
      )}
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 8 }}>
        {onEdit && (
          <button onClick={onEdit} style={{ background: "#22d3ee", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Edit</button>
        )}
        {onRevoke && (
          <button onClick={onRevoke} style={{ background: "#f85149", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Revoke</button>
        )}
      </div>
    </div>
  )
}
