"use client"
import React, { useEffect, useState, useRef } from "react"
import { Wifi } from "lucide-react"
import { EdgeStreamSlot } from "../../../types/atlas"

function relTime(ts: number | string) {
  if (!ts) return "—"
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts
  const d = Math.floor((Date.now() - t) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  return `${Math.floor(d / 3600)}h ago`
}

const GATE_COLORS = {
  stay_quiet: "#484f58",
  nudge: "#22d3ee",
  interrupt_for_safety: "#f85149",
}

export default function EdgeStreamConsole() {
  const [fpsHistory, setFpsHistory] = useState<number[]>([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [ingesting, setIngesting] = useState(false)
  const [slot, setSlot] = useState<any>(null)
  const [source, setSource] = useState("")
  const [region, setRegion] = useState("")
  const [slotId, setSlotId] = useState("default")
  const [sseLog, setSseLog] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Poll slot stats
  useEffect(() => {
    const poll = () => fetch(`/api/edge/stats/${slotId}`).then(r => r.json()).then(j => {
      setSlot(j.data)
      setFpsHistory(h => {
        const arr = [...h, j.data.fps]
        return arr.length > 30 ? arr.slice(arr.length - 30) : arr
      })
    })
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [slotId])

  // SSE log
  useEffect(() => {
    let es: EventSource
    function connectSSE() {
      es = new window.EventSource("/api/nepa/anomalies/live")
      es.addEventListener("anomaly", e => {
        setSseLog(prev => [JSON.parse(e.data), ...prev].slice(0, 25))
      })
      es.onerror = () => { es.close(); setTimeout(connectSSE, 3000) }
    }
    connectSSE()
    return () => es && es.close()
  }, [])

  // Clipboard paste
  useEffect(() => {
    const onPaste = (e: any) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i: any) => i.type.startsWith("image/"))
      if (item && typeof item.getAsFile === 'function') {
        setSelectedFile(item.getAsFile())
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [])

  const ingestFrame = async () => {
    if (!selectedFile) return
    setIngesting(true)
    const form = new FormData()
    form.append("frame", selectedFile, "frame.jpg")
    form.append("slot_id", slotId)
    form.append("source", source || "fleet_monitor")
    form.append("region", region || "FULL")
    const j = await fetch("/api/edge/ingest", { method: "POST", body: form }).then(r => r.json())
    setLastResult(j.data)
    setIngesting(false)
  }

  // FPS sparkline
  function FpsSparkline({ data }: { data: number[] }) {
    return (
      <svg width={180} height={32} style={{ background: "#111827", borderRadius: 6 }}>
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          points={data.map((v, i) => `${6 + i * 6},${30 - (v - 10)}` ).join(" ")}
        />
        <line x1={0} y1={30 - (24 - 10)} x2={180} y2={30 - (24 - 10)} stroke="#64748b" strokeDasharray="4 4" />
      </svg>
    )
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100vh", background: "#000" }}>
      {/* Left: Edge Stream Console */}
      <div style={{ padding: 20, background: "#0d1117", borderRight: "1px solid #1f2937", height: "100vh", overflow: "auto" }}>
        {/* Slot status panel */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 15, marginBottom: 8 }}>EDGE STREAM SLOTS</div>
          {slot && (
            <div style={{ background: "#111827", borderRadius: 8, padding: 14, color: "#cbd5e1", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#22d3ee", color: "#fff", borderRadius: 6, fontSize: 11, padding: "2px 8px", fontWeight: 700 }}>{slot.slot_id}</span>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: slot.status === "streaming" ? "#22d3ee" : slot.status === "open" ? "#f59e0b" : slot.status === "error" ? "#f85149" : "#484f58", display: "inline-block", marginRight: 4 }} />
                <span style={{ fontSize: 13, color: slot.fps > 25 ? "#3fb950" : slot.fps >= 15 ? "#f59e0b" : "#f85149" }}>{slot.fps}fps</span>
                <span style={{ fontSize: 13, color: slot.bitrate_kbps > 0 ? "#22d3ee" : "#64748b" }}>{slot.bitrate_kbps}kbps</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>p50:{slot.latency_p50_ms}ms  p95:{slot.latency_p95_ms}ms</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{slot.frames_processed} frames  {slot.errors} errors</div>
            </div>
          )}
        </div>
        {/* Frame ingest panel */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 15, marginBottom: 8 }}>INGEST FRAME TO NEPA</div>
          <div
            style={{ border: "2px dashed #22d3ee", background: "rgba(34,211,238,0.05)", borderRadius: 8, padding: 18, textAlign: "center", marginBottom: 8, cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files[0]
              if (file && file.type.startsWith("image/")) setSelectedFile(file)
            }}
          >
            {selectedFile ? selectedFile.name : "DRAG & DROP or CLICK TO SELECT"}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files[0])} />
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>or paste clipboard image</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="SOURCE" style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #1f2937", background: "#111827", color: "#cbd5e1" }} />
            <input value={region} onChange={e => setRegion(e.target.value)} placeholder="REGION" style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #1f2937", background: "#111827", color: "#cbd5e1" }} />
            <input value={slotId} onChange={e => setSlotId(e.target.value)} placeholder="SLOT ID" style={{ width: 90, padding: 6, borderRadius: 6, border: "1px solid #1f2937", background: "#111827", color: "#cbd5e1" }} />
          </div>
          <button onClick={ingestFrame} disabled={ingesting || !selectedFile} style={{ background: "#22d3ee", color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", marginBottom: 8 }}>{ingesting ? "INGESTING..." : "⚡ INGEST FRAME"}</button>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>LAST RESULT:</div>
          {lastResult ? (
            <div style={{ background: "#111827", borderRadius: 8, padding: 10, color: "#cbd5e1", fontFamily: "monospace", fontSize: 12 }}>
              pipeline: {lastResult.pipeline} | gate: <span style={{ background: GATE_COLORS[lastResult.gate], color: "#fff", borderRadius: 4, padding: "1px 6px" }}>{lastResult.gate}</span> | latency: {lastResult.latency_ms}ms<br />
              {lastResult.detections?.length ?? 0} detections | runtime: {lastResult.runtime}
            </div>
          ) : <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>NO FRAME INGESTED YET.</div>}
        </div>
        {/* SSE event log */}
        <div style={{ flex: 1, minHeight: 120, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 15, marginBottom: 8 }}>ANOMALY EVENTS</div>
          {sseLog.length === 0 ? (
            <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13 }}>AWAITING ANOMALY EVENTS · SSE BUS OPEN.</div>
          ) : sseLog.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 13, color: GATE_COLORS[a.gate] }}>
              <span style={{ width: 52, display: "inline-block", textAlign: "center", borderRadius: 6, background: GATE_COLORS[a.gate], color: "#fff", fontWeight: 700, fontSize: 11 }}>{a.gate?.toUpperCase()?.slice(0, 6) || "—"}</span>
              {a.kind} score:{a.score?.toFixed(2)} gate:{a.gate} region:{a.region} {relTime(a.ts_ms)}
            </div>
          ))}
        </div>
      </div>
      {/* Right: Live inference result display */}
      <div style={{ padding: 32, overflowY: "auto" }}>
        <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 18, marginBottom: 16 }}>NEPA EDGE INFERENCE · LIVE RESULTS</div>
        {lastResult ? (
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 8, padding: 20, color: "#cbd5e1", maxWidth: 520, fontFamily: "monospace", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <b>GATE:</b> <span style={{ background: GATE_COLORS[lastResult.gate], color: "#fff", borderRadius: 6, fontWeight: 700, padding: "2px 10px" }}>{lastResult.gate}</span>
              <span style={{ marginLeft: "auto" }}>PIPELINE: {lastResult.pipeline} RUNTIME: {lastResult.runtime}</span>
            </div>
            <div style={{ marginBottom: 8 }}>LATENCY: {lastResult.latency_ms}ms  AUDIT: {lastResult.audit_id ? String(lastResult.audit_id).slice(0, 8) : "—"}</div>
            <div style={{ marginBottom: 8 }}>
              <b>DETECTIONS ({lastResult.detections?.length ?? 0})</b>
              <div style={{ background: "#111827", borderRadius: 6, padding: 8, marginTop: 4 }}>
                <div style={{ display: "flex", fontWeight: 700, gap: 12 }}><span style={{ width: 80 }}>class</span><span style={{ width: 60 }}>score</span><span style={{ width: 120 }}>bbox</span></div>
                {lastResult.detections?.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <span style={{ width: 80 }}>{d.class}</span>
                    <span style={{ width: 60 }}>{d.score?.toFixed(2)}</span>
                    <span style={{ width: 120 }}>{d.bbox?.join(",")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>STDP</b><br />
              spike_rate: {lastResult.stdp?.spike_rate}Hz  sparsity: {lastResult.stdp?.sparsity}<br />
              plasticity: {lastResult.stdp?.plasticity}  energy: {lastResult.stdp?.energy}W
            </div>
            <div>
              <b>WORLD MODEL</b><br />
              pred_error: {lastResult.world_model?.prediction_error}  horizon: {lastResult.world_model?.horizon}f<br />
              anomaly_flag: <span style={{ background: lastResult.world_model?.anomaly_flag ? "#f85149" : "#22d3ee", color: "#fff", borderRadius: 4, padding: "1px 6px" }}>{lastResult.world_model?.anomaly_flag ? "YES" : "NO"}</span>  latent_dim: {lastResult.world_model?.latent_dim}
            </div>
          </div>
        ) : (
          <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 18, fontWeight: 500 }}>
            WAITING FOR FRAME INGEST · USE THE PANEL ON THE LEFT OR POST TO /api/edge/ingest.
          </div>
        )}
        {/* FPS sparkline */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontWeight: 700, color: "#22d3ee", fontSize: 15, marginBottom: 8 }}>FPS HISTORY · LAST 30 READINGS</div>
          <FpsSparkline data={fpsHistory} />
        </div>
      </div>
    </div>
  )
}
