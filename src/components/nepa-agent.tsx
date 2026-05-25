"use client"
import React, { useEffect, useState } from "react"
import { NermStatus } from '@/src/types/ardupilot'

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  endpoint?: string
  ts: string
}

const QUICK_ACTIONS = [
  { label: 'OS Status',      query: 'status'      },
  { label: 'Active Threats', query: 'threats'     },
  { label: 'Missions',       query: 'missions'    },
  { label: 'Fleet',          query: 'fleet'       },
  { label: 'NERM',           query: 'nerm status' },
  { label: 'Calibration',    query: 'calibration' },
  { label: 'Flight Modes',   query: 'modes'       },
  { label: 'Weather',        query: 'weather'     },
  { label: 'Audit Chain',    query: 'audit chain' },
  { label: 'Logs',           query: 'logs'        },
]

function nowStr() {
  return new Date().toLocaleTimeString('en-HK', { hour:'2-digit', minute:'2-digit' })
}

function mkReply(text: string, endpoint: string): Message {
  return { id: Date.now().toString(), role:'agent', text, endpoint, ts: nowStr() }
}

export default function NepaAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [nermStatus, setNermStatus] = useState<NermStatus | null>(null)

  useEffect(() => {
    fetch('/api/nepa/nerm/status').then(r=>r.json()).then(j => setNermStatus(j.data))
  }, [])

  const sendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role:'user', text, ts: nowStr() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinking(true)
    let reply: Message
    const lower = text.toLowerCase()
    try {
      if (lower.includes('threat') || lower.includes('track') || lower.includes('engage')) {
        const j = await fetch('/api/atlas/threat/tracks').then(r=>r.json())
        const tracks = j.data?.tracks ?? []
        const engaged = tracks.filter((t: any) => t.threat_state === 'engaged').length
        const tracked = tracks.filter((t: any) => t.threat_state === 'tracked').length
        reply = mkReply(`${tracks.length} threat tracks active. ${tracked} tracked, ${engaged} engaged. Highest domain: ${tracks[0]?.domain ?? '—'}. Formation: ${tracks.find((t: any)=>t.formation_geometry)?.formation_geometry ?? 'none'}.`, '/api/atlas/threat/tracks')
      }
      else if (lower.includes('mission') || lower.includes('flight') || lower.includes('waypoint')) {
        const j = await fetch('/api/atlas/missions').then(r=>r.json())
        const ms = j.data?.missions ?? []
        const inflight = ms.filter((m: any) => m.state === 'in_flight')
        reply = mkReply(`${ms.length} missions in store. ${inflight.length} in-flight: ${inflight.map((m: any)=>m.name).join(', ') || 'none'}. Latest: ${ms[0]?.name ?? '—'}.`, '/api/atlas/missions')
      }
      else if (lower.includes('asset') || lower.includes('registry') || lower.includes('drone') || lower.includes('fleet')) {
        const j = await fetch('/api/registry/drones').then(r=>r.json())
        const units = j.data?.units ?? []
        const inMission = units.filter((u: any) => u.status === 'in_mission').length
        const unverified = units.filter((u: any) => u.status === 'unverified').length
        reply = mkReply(`Fleet: ${units.length} assets. ${inMission} in mission, ${unverified} unverified. Avg battery: ${Math.round(units.filter((u:any)=>u.battery_pct!=null).reduce((a:number,u:any)=>a+u.battery_pct,0)/Math.max(1,units.filter((u:any)=>u.battery_pct!=null).length))}%.`, '/api/registry/drones')
      }
      else if (lower.includes('audit') || lower.includes('chain') || lower.includes('evidence')) {
        const j = await fetch('/api/atlas/evidence/health').then(r=>r.json())
        const h = j.data ?? {}
        reply = mkReply(`Audit chain: ${h.total_records ?? 0} records. Chain ${h.chain_valid ? 'INTACT ✓' : 'BROKEN ⚠'}. Latest pipeline: ${h.pipeline_breakdown?.[0]?.pipeline ?? '—'}.`, '/api/atlas/evidence/health')
      }
      else if (lower.includes('nerm') || lower.includes('spike') || lower.includes('neuromorphic')) {
        const j = await fetch('/api/nepa/nerm/status').then(r=>r.json())
        const n: NermStatus = j.data ?? {}
        setNermStatus(n)
        reply = mkReply(`NERM mode: ${n.mode}. Inference: ${n.inference_hz?.toFixed(0) ?? 0} Hz. Latency p50: ${n.latency_p50_ms?.toFixed(1) ?? '—'}ms. Energy: ${n.energy_uw?.toFixed(0) ?? '—'} μW. Spike rate: ${n.spike_rate_hz?.toFixed(0) ?? 0} Hz.`, '/api/nepa/nerm/status')
      }
      else if (lower.includes('calibrat')) {
        const j = await fetch('/api/atlas/ardupilot/calibration').then(r=>r.json())
        const sensors = j.data?.sensors ?? {}
        const weak = Object.values(sensors).filter((s: any) => s.confidence < 0.80)
        reply = mkReply(`Calibration: ${Object.keys(sensors).length} sensors. ${weak.length} need attention: ${weak.map((s: any)=>s.sensor).join(', ') || 'none'}. Compass confidence: ${((sensors.compass?.confidence ?? 0)*100).toFixed(0)}%.`, '/api/atlas/ardupilot/calibration')
      }
      else if (lower.includes('mode') || lower.includes('flight mode') || lower.includes('loiter') || lower.includes('rtl')) {
        const j = await fetch('/api/atlas/ardupilot/modes').then(r=>r.json())
        const slots = j.data?.slots ?? []
        reply = mkReply(`Flight modes: ${slots.map((s: any)=>`Slot${s.slot}:${s.mode}`).join(' | ')}. Current slot: ${j.data?.current_slot ?? 1}.`, '/api/atlas/ardupilot/modes')
      }
      else if (lower.includes('log') || lower.includes('replay')) {
        const j = await fetch('/api/atlas/ardupilot/logs').then(r=>r.json())
        const logs = j.data?.logs ?? []
        const withAnomalies = logs.filter((l: any) => l.has_anomalies)
        reply = mkReply(`${logs.length} flight logs. ${withAnomalies.length} with anomalies. Latest: ${logs[0]?.filename ?? '—'} (${((logs[0]?.size_bytes ?? 0)/1024/1024).toFixed(1)} MB).`, '/api/atlas/ardupilot/logs')
      }
      else if (lower.includes('status') || lower.includes('health') || lower.includes('os')) {
        const j = await fetch('/api/atlas/os-status').then(r=>r.json())
        const s = j.data ?? {}
        reply = mkReply(`OS Status: ${s.active_threats} active threats, ${s.in_flight_missions} missions in-flight, ${s.enrolled_assets} enrolled assets. Runtime: ${s.runtime_adapter} (${s.runtime_ok?'OK':'ERROR'}). Chain: ${s.chain_valid?'intact':'BROKEN'}. Advisory: ${s.flight_advisory}.`, '/api/atlas/os-status')
      }
      else if (lower.includes('weather') || lower.includes('wx') || lower.includes('wind') || lower.includes('fly')) {
        const j = await fetch('/api/wx/current').then(r=>r.json())
        const w = j.data ?? {}
        reply = mkReply(`Weather: ${w.flight_advisory} advisory. Wind ${w.wind_speed_ms?.toFixed(1) ?? '—'}m/s ${w.wind_dir_cardinal ?? '—'}. Visibility ${w.visibility_km ?? '—'}km. Ceiling ${w.ceiling_m ?? '—'}m.`, '/api/wx/current')
      }
      else {
        const j = await fetch('/api/atlas/os-status').then(r=>r.json())
        const s = j.data ?? {}
        reply = mkReply(`ATLAS OS nominal. ${s.enrolled_assets} assets, ${s.active_threats} threats, ${s.in_flight_missions} missions in-flight. Type 'threats', 'missions', 'fleet', 'nerm', 'calibration', 'modes', 'logs', or 'weather' for details.`, '/api/atlas/os-status')
      }
    } catch (err) {
      reply = mkReply(`NEPA runtime error: ${(err as Error).message}. Check /api/atlas/os-status.`, '/api/nepa/status')
    }
    setMessages(prev => [...prev, reply])
    setThinking(false)
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-[#18181b] rounded-xl shadow-lg w-96 p-4 flex flex-col gap-2 border border-cyan-400">
        {/* NERM Status Strip */}
        {nermStatus && (
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span>NERM</span>
            <span className="font-bold" style={{ color: nermStatus.mode==='ACTIVE' ? '#22d3ee' : nermStatus.mode==='STANDBY' ? '#f59e0b' : nermStatus.mode==='EMERGENCY' ? '#f85149' : '#888' }}>{nermStatus.mode}</span>
            <span>· {nermStatus.inference_hz?.toFixed(0)}Hz</span>
            <span>· {nermStatus.energy_uw?.toFixed(0)}μW</span>
            <span>· {nermStatus.latency_p50_ms?.toFixed(1)}ms p50</span>
          </div>
        )}
        {/* Quick Actions */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {QUICK_ACTIONS.map(a => (
            <Button key={a.label} size="sm" variant="outline" onClick={()=>sendMessage(a.query)}>{a.label}</Button>
          ))}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-[#23272e] rounded p-2 mb-2" style={{ maxHeight: 220 }}>
          {messages.map(m => (
            <div key={m.id} className={m.role==='user' ? 'text-right' : 'text-left'}>
              <div className={m.role==='user' ? 'bg-cyan-900 text-cyan-100' : 'bg-gray-800 text-gray-100'} style={{ display:'inline-block', borderRadius:8, padding:'6px 12px', margin:'2px 0', fontSize:14 }}>
                {m.text}
                {m.endpoint && <span className="ml-2 text-xs text-cyan-400">[{m.endpoint}]</span>}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ padding:'8px 12px', display:'flex', gap:4 }}>
              <span style={{ animation:'dot-blink 1s 0s infinite', color:'#22d3ee' }}>●</span>
              <span style={{ animation:'dot-blink 1s 0.2s infinite', color:'#22d3ee' }}>●</span>
              <span style={{ animation:'dot-blink 1s 0.4s infinite', color:'#22d3ee' }}>●</span>
            </div>
          )}
        </div>
        {/* Input */}
        <form className="flex gap-2 mt-2" onSubmit={e=>{e.preventDefault();if(input.trim())sendMessage(input)}}>
          <input className="flex-1 rounded bg-gray-900 border px-2 py-1 text-white" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask NEPA…" />
          <Button type="submit" disabled={thinking || !input.trim()}>Send</Button>
        </form>
      </div>
      <style>{`@keyframes dot-blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }`}</style>
    </div>
  )
}
