"use client"


import React, { useEffect, useState } from "react"
import type {
  ThreatConsoleState,
  ThreatTrack,
  DomainSummary
} from "../../../types/atlas-threat"
import DomainHeaderStrip from "../../../components/atlas/DomainHeaderStrip"
import TrackCard from "../../../components/atlas/threat/TrackCard"
import EngagementAuthorityLog from "../../../components/atlas/threat/EngagementAuthorityLog"

const operatorId = "SGP-OPS-001"
const sovereigntyFence = "SGP-MINDEF"

export default function ThreatConsolePage() {
  const [state, setState] = useState<ThreatConsoleState | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<ThreatTrack | null>(null)
  const [engagingTrack, setEngagingTrack] = useState<string | null>(null)
  const [flashTracks, setFlashTracks] = useState<Set<string>>(new Set())
  const [tokenCountdowns, setTokenCountdowns] = useState<Map<string, number>>(new Map())
  const [stateDialogTrack, setStateDialogTrack] = useState<ThreatTrack | null>(null)

  // Fetch initial state
  useEffect(() => {
    fetch("/api/atlas/threat/tracks")
      .then(r => r.json())
      .then(j => setState(j.data))
  }, [])

  // SSE connection for live updates
  useEffect(() => {
    let es: EventSource | null = null
    function connect() {
      es = new EventSource("/api/atlas/threat/stream")
      es.addEventListener("track_update", (e: any) => {
        const track = JSON.parse(e.data) as ThreatTrack
        setState(prev => prev ? mergeTrackUpdate(prev, track) : prev)
        setFlashTracks(s => { const n = new Set(s); n.add(track.id); return n })
        setTimeout(() => setFlashTracks(s => { const n = new Set(s); n.delete(track.id); return n }), 800)
      })
      es.onerror = () => { es?.close(); setTimeout(connect, 3000) }
    }
    connect()
    return () => { es?.close() }
  }, [])

  // Token countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state?.authority_log) return
      setTokenCountdowns(prev => {
        const map = new Map<string, number>()
        for (const t of state.authority_log) {
          map.set(t.track_id, t.exp_unix - Math.floor(Date.now() / 1000))
        }
        return map
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state])

  // --- UI Layout ---
  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Row 1: Domain Header Strip */}
      <div style={{ height: 52, flexShrink: 0, background: "var(--bg-elevated)" }}>
        <DomainHeaderStrip domainSummaries={state?.domain_summaries ?? []} />
      </div>
      {/* Row 2: Main Track Grid */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 1, background: "var(--bg-surface)", padding: 16, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 24 }}>
          {state?.tracks?.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              flash={flashTracks.has(track.id)}
              onAdvance={to => handleAdvance(track.id, to)}
              onEngage={() => handleEngage(track.id)}
              engaging={engagingTrack === track.id}
            />
          ))}
        </div>
      </div>
      {/* Row 3: Engagement Authority Log Strip */}
      <div style={{ height: 128, flexShrink: 0, background: "var(--bg-elevated)", borderTop: "1px solid var(--border)" }}>
        <EngagementAuthorityLog log={state?.authority_log ?? []} tokenCountdowns={tokenCountdowns} />
      </div>
    </div>
  )
}


// Helper to merge track updates into state
function mergeTrackUpdate(state: ThreatConsoleState, track: ThreatTrack): ThreatConsoleState {
  const tracks = state.tracks.map(t => t.id === track.id ? track : t)
  return { ...state, tracks }
}

// Action handlers
function handleAdvance(trackId: string, to: string) {
  fetch(`/api/atlas/threat/tracks/${trackId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, operator_id: operatorId })
  })
}

function handleEngage(trackId: string) {
  // Set engaging state
  // This is a simplified optimistic update; production should handle errors and update state accordingly
  // @ts-ignore
  setEngagingTrack(trackId)
  fetch('/api/atlas/threat/engage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track_id: trackId, operator_id: operatorId, sovereignty_fence: sovereigntyFence })
  }).finally(() => {
    // @ts-ignore
    setEngagingTrack(null)
  })
}
