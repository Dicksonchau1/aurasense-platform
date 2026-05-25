"use client"
import React, { useEffect, useState } from "react"
import { FlightModeConfig, ModeSlot, ArduPilotFlightMode, ModeChangeRecord } from '@/src/types/ardupilot'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from '@/src/lib/utils'

const MODE_LIST: ArduPilotFlightMode[] = [
  'STABILIZE','ACRO','ALT_HOLD','AUTO','GUIDED','LOITER','RTL','CIRCLE','LAND','DRIFT','SPORT','POSHOLD','BRAKE','THROW','SMART_RTL','FLOWHOLD','FOLLOW','ZIGZAG'
]
const MODE_COLOURS: Record<ArduPilotFlightMode, string> = {
  STABILIZE: '#22d3ee', ACRO: '#f59e0b', ALT_HOLD: '#3fb950',
  AUTO: '#a78bfa', GUIDED: '#d946ef', LOITER: '#2dd4bf',
  RTL: '#f85149', CIRCLE: '#60a5fa', LAND: '#fb923c',
  DRIFT: '#facc15', SPORT: '#f472b6', POSHOLD: '#4ade80',
  BRAKE: '#f87171', THROW: '#c084fc', SMART_RTL: '#f85149',
  FLOWHOLD: '#22d3ee', FOLLOW: '#a78bfa', ZIGZAG: '#fbbf24',
}

export default function ModesSection({ assetId }: { assetId?: string }) {
  const [slots, setSlots] = useState<FlightModeConfig[]>([])
  const [currentSlot, setCurrentSlot] = useState<ModeSlot>(1)
  const [history, setHistory] = useState<ModeChangeRecord[]>([])
  const [editingSlot, setEditingSlot] = useState<ModeSlot | null>(null)
  const [selectedMode, setSelectedMode] = useState<ArduPilotFlightMode>('STABILIZE')
  const [changing, setChanging] = useState(false)
  const operatorId = 'SGP-OPS-001'
  useEffect(() => {
    fetch('/api/atlas/ardupilot/modes').then(r=>r.json()).then(j => {
      setSlots(j.data.slots)
      setCurrentSlot(j.data.current_slot)
      setHistory(j.data.history)
    })
  }, [])
  const applyModeChange = async () => {
    setChanging(true)
    const j = await fetch('/api/atlas/ardupilot/modes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: editingSlot, mode: selectedMode, operator_id: operatorId })
    }).then(r=>r.json())
    setSlots(j.data.slots)
    setHistory(j.data.history ?? history)
    setEditingSlot(null)
    setChanging(false)
  }
  return (
    <div className="w-full flex flex-col items-center p-8">
      <div className="grid grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        {slots.map(slot => (
          <div key={slot.slot} className={cn("rounded-lg p-4 shadow flex flex-col gap-2 cursor-pointer border-2 transition-all", currentSlot===slot.slot ? "border-cyan-400 bg-cyan-100/10" : "border-gray-700 bg-gray-900")}
            onClick={()=>setCurrentSlot(slot.slot)}>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono">SLOT {slot.slot}</span>
              <span className="ml-auto">{slot.label}</span>
            </div>
            <div className="font-bold text-lg" style={{ color: MODE_COLOURS[slot.mode] }}>{slot.mode}</div>
            <div className="text-xs">PWM: {slot.rc_pwm_min}–{slot.rc_pwm_max} μs</div>
            <Button size="sm" variant="outline" className="mt-2" onClick={e=>{e.stopPropagation();setEditingSlot(slot.slot);setSelectedMode(slot.mode)}}>EDIT ✎</Button>
          </div>
        ))}
      </div>
      {editingSlot && (
        <div className="w-full max-w-xl bg-[#23272e] rounded-lg shadow p-6 mb-6 animate-fade-in">
          <div className="font-bold mb-2">EDITING SLOT {editingSlot}</div>
          <div className="flex gap-4 mb-2">
            <div>
              <label className="block text-xs mb-1">MODE</label>
              <select className="bg-gray-900 border rounded px-2 py-1" value={selectedMode} onChange={e=>setSelectedMode(e.target.value as ArduPilotFlightMode)}>
                {MODE_LIST.map(m=>(<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <Button onClick={applyModeChange} disabled={changing}>APPLY CHANGE ⚡</Button>
            <Button variant="outline" onClick={()=>setEditingSlot(null)}>CANCEL</Button>
          </div>
        </div>
      )}
      <div className="w-full max-w-3xl mt-4">
        <div className="font-bold mb-2">Mode Change History</div>
        <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
          <table className="w-full text-xs">
            <thead><tr><th>Timestamp</th><th>Slot</th><th>From</th><th></th><th>To</th><th>Operator</th><th>Token</th></tr></thead>
            <tbody>
              {history.map((h,i)=>(
                <tr key={i}>
                  <td>{new Date(h.ts).toLocaleTimeString()}</td>
                  <td>{h.slot}</td>
                  <td style={{ color: MODE_COLOURS[h.from_mode] }}>{h.from_mode}</td>
                  <td>→</td>
                  <td style={{ color: MODE_COLOURS[h.to_mode] }}>{h.to_mode}</td>
                  <td>{h.operator_id}</td>
                  <td className="font-mono" style={{ fontSize:8 }}>{h.hmac_token.slice(0,8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}