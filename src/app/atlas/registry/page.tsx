'use client';

import React, { useEffect, useState } from "react"
import type { RegistryAsset, TopologyGraph } from "../../../types/atlas"
import AssetCard from "../../../components/atlas/registry/AssetCard"
import TopologyGraphSVG from "../../../components/atlas/registry/TopologyGraphSVG"
import EnrollAssetSheet from "../../../components/atlas/registry/EnrollAssetSheet"
import EditAssetSheet from "../../../components/atlas/registry/EditAssetSheet"
import RevokeAssetDialog from "../../../components/atlas/registry/RevokeAssetDialog"

const toast = (opts: { title: string; description?: string; status?: string }) =>
  console.warn('[toast]', opts)

export default function RegistryPage() {
  const [assets, setAssets] = useState<RegistryAsset[]>([])
  const [graph, setGraph] = useState<TopologyGraph | null>(null)
  const [tab, setTab] = useState<'registry' | 'broker'>('registry')
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [beaconBusy, setBeaconBusy] = useState(false)
  const [showEnroll, setShowEnroll] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editAsset, setEditAsset] = useState<RegistryAsset | null>(null)
  const [showRevoke, setShowRevoke] = useState(false)
  const [revokeAsset, setRevokeAsset] = useState<RegistryAsset | null>(null)

  useEffect(() => {
    fetch("/api/atlas/registry/assets").then(r => r.json()).then(j => { if (j.data?.assets) setAssets(j.data.assets) })
    fetch("/api/atlas/registry/topology").then(r => r.json()).then(j => setGraph(j.data))
  }, [])

  const toggleEmergency = async (on: boolean) => {
    setEmergencyMode(on)
    setBeaconBusy(true)
    try {
      await fetch('/api/atlas/registry/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergency: on, operator_id: 'OPS-001' }),
      })
      toast({ title: on ? 'Emergency Mode Enabled' : 'Emergency Mode Disabled' })
      fetch("/api/atlas/registry/assets").then(r => r.json()).then(j => { if (j.data?.assets) setAssets(j.data.assets) })
      fetch("/api/atlas/registry/topology").then(r => r.json()).then(j => setGraph(j.data))
    } catch (err) {
      toast({ title: 'Emergency Toggle Failed', description: (err as any)?.message || 'Unknown error', status: 'error' })
      setEmergencyMode(!on)
    } finally {
      setBeaconBusy(false)
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-surface)" }}>
      <div style={{ height: 40, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => setTab('registry')} style={{ flex: 1, background: tab === 'registry' ? '#111418' : 'transparent', color: tab === 'registry' ? '#22d3ee' : '#9ca3af', border: 'none', fontWeight: 700, height: '100%', cursor: 'pointer' }}>EffectorRegistry</button>
        <button onClick={() => setTab('broker')} style={{ flex: 1, background: tab === 'broker' ? '#111418' : 'transparent', color: tab === 'broker' ? '#22d3ee' : '#9ca3af', border: 'none', fontWeight: 700, height: '100%', cursor: 'pointer' }}>AgenticMobilityBroker</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: 20 }}>
        <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowEnroll(true)} style={{ padding: "6px 12px", background: "#22d3ee", color: "#111", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>Enroll asset</button>
          <button onClick={() => toggleEmergency(!emergencyMode)} disabled={beaconBusy} style={{ padding: "6px 12px", background: emergencyMode ? "#ef4444" : "#374151", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {emergencyMode ? 'Disable emergency' : 'Enable emergency'}
          </button>
          {beaconBusy && <span style={{ color: '#22d3ee' }}>working...</span>}
        </div>
        {tab === 'registry' ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={() => { setEditAsset(asset); setShowEdit(true) }}
                onRevoke={() => { setRevokeAsset(asset); setShowRevoke(true) }}
              />
            ))}
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            {graph && <TopologyGraphSVG graph={graph} />}
          </div>
        )}
      </div>
      <EnrollAssetSheet open={showEnroll} onClose={() => setShowEnroll(false)} onEnrolled={(a: RegistryAsset) => setAssets(prev => [...prev, a])} />
      <EditAssetSheet open={showEdit} asset={editAsset} onClose={() => setShowEdit(false)} onEdited={(updated: RegistryAsset) => setAssets(a => a.map(x => x.id === updated.id ? updated : x))} />
      <RevokeAssetDialog open={showRevoke} asset={revokeAsset} onClose={() => setShowRevoke(false)} onRevoked={(id: string) => setAssets(a => a.filter(x => x.id !== id))} />
    </div>
  )
}
