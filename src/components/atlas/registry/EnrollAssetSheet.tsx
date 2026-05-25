'use client';

import React, { useState } from "react"
import type { NewRegistryAsset } from "../../../types/atlas"

const initialForm: Partial<NewRegistryAsset> = {
  oem: "",
  model: "",
  capability_class: "AERIAL_INTERCEPT",
  source: "effector_registry",
  status: "active",
  command_protocol: "mavlink",
  kinematic_envelope: { max_speed_mps: 0, range_m: 0, endurance_s: 0 },
  sovereignty_fence: { jurisdiction: "SGP-MINDEF", region_code: "sgp-1", classification: "RESTRICTED", valid_from: "2026-01-01T00:00:00Z", valid_until: "2099-12-31T23:59:59Z", engagement_rules_hash: "hash" },
  battery_pct: 100
}

export default function EnrollAssetSheet({ open, onClose, onEnrolled }: {
  open: boolean
  onClose: () => void
  onEnrolled: (asset: any) => void
}) {
  const [form, setForm] = useState<Partial<NewRegistryAsset>>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/atlas/registry/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Validation error')
      onEnrolled(data.data)
      onClose()
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#161b22', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 8px 32px #0008', color: '#f5f5f5' }}>
        <div style={{ fontWeight: 700, color: '#22d3ee', fontSize: 18, marginBottom: 18 }}>Enroll New Asset</div>
        <div style={{ marginBottom: 12 }}>
          <label>OEM<br /><input name="oem" value={form.oem} onChange={handleChange} required style={inputStyle} /></label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Model<br /><input name="model" value={form.model} onChange={handleChange} required style={inputStyle} /></label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Capability Class<br />
            <select name="capability_class" value={form.capability_class} onChange={handleChange} required style={inputStyle}>
              <option value="AERIAL_INTERCEPT">AERIAL_INTERCEPT</option>
              <option value="AERIAL_ISR">AERIAL_ISR</option>
              <option value="AERIAL_RESUPPLY">AERIAL_RESUPPLY</option>
              <option value="GROUND_PATROL">GROUND_PATROL</option>
              <option value="GROUND_BREACH">GROUND_BREACH</option>
              <option value="PERIMETER_LOCK">PERIMETER_LOCK</option>
              <option value="MARITIME_INTERCEPT">MARITIME_INTERCEPT</option>
              <option value="MARITIME_ISR">MARITIME_ISR</option>
              <option value="INDUSTRIAL_ACTUATOR">INDUSTRIAL_ACTUATOR</option>
              <option value="SENSOR_ONLY">SENSOR_ONLY</option>
              <option value="DIRECTED_ENERGY">DIRECTED_ENERGY</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Command Protocol<br />
            <select name="command_protocol" value={form.command_protocol} onChange={handleChange} required style={inputStyle}>
              <option value="mavlink">mavlink</option>
              <option value="ros2_nav2">ros2_nav2</option>
              <option value="modbus">modbus</option>
              <option value="udp_directed_energy">udp_directed_energy</option>
              <option value="proprietary">proprietary</option>
              <option value="can_bus">can_bus</option>
            </select>
          </label>
        </div>
        {/* Add more fields as needed */}
        {error && <div style={{ color: '#f85149', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, background: '#222', color: '#9ca3af' }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ ...btnStyle, background: '#22d3ee', color: '#fff' }}>{submitting ? 'Enrolling...' : 'Enroll'}</button>
        </div>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #222',
  background: '#111418',
  color: '#f5f5f5',
  marginTop: 4
}
const btnStyle: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 6,
  border: 'none',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer'
}
