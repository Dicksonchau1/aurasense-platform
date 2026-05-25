"use client"
import React, { useEffect, useState } from "react"
import { CalibrationSensor, SensorCalibrationState, CalibrationStepId } from '@/src/types/ardupilot'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from '@/src/lib/utils'

const SENSOR_ICONS: Record<CalibrationSensor, React.ReactNode> = {
  accelerometer: <span className="text-xl">🏃‍♂️</span>,
  gyroscope: <span className="text-xl">🔄</span>,
  compass: <span className="text-xl">🧭</span>,
  esc: <span className="text-xl">⚡</span>,
  level: <span className="text-xl">📏</span>,
}

const STEP_ILLUSTRATIONS: Record<CalibrationStepId, { emoji: string; label: string }> = {
  idle:            { emoji: '⏸',  label: 'Ready to calibrate' },
  pre_check:       { emoji: '🔍', label: 'Running pre-flight checks' },
  position_flat:   { emoji: '🛸', label: 'Hold vehicle LEVEL, top facing up' },
  position_left:   { emoji: '◀',  label: 'Hold vehicle on LEFT side' },
  position_right:  { emoji: '▶',  label: 'Hold vehicle on RIGHT side' },
  position_nose_down: { emoji: '⬇', label: 'Hold vehicle NOSE DOWN' },
  position_nose_up:   { emoji: '⬆', label: 'Hold vehicle NOSE UP' },
  position_back:   { emoji: '🔄', label: 'Hold vehicle on BACK, top down' },
  collecting:      { emoji: '📡', label: 'Collecting sensor data — keep still' },
  computing:       { emoji: '⚙️', label: 'Computing calibration offsets…' },
  commit:          { emoji: '✍️', label: 'Committing to flight controller' },
  complete:        { emoji: '✅', label: 'Calibration complete' },
  failed:          { emoji: '❌', label: 'Calibration failed — retry' },
}

const CONFIDENCE_COLORS = [
  { min: 0.9, color: '#3fb950' },
  { min: 0.7, color: '#f59e0b' },
  { min: 0.0, color: '#f85149' },
]

function getConfidenceColor(conf: number) {
  return CONFIDENCE_COLORS.find(c => conf >= c.min)!.color
}

function getStatusColor(step: CalibrationStepId) {
  switch (step) {
    case 'idle': return '#484f58'
    case 'pre_check': return '#22d3ee'
    case 'collecting': return '#a78bfa'
    case 'computing': return '#f59e0b'
    case 'complete': return '#3fb950'
    case 'failed': return '#f85149'
    default: return '#484f58'
  }
}

export default function CalibrationSection({ onComplete }: { onComplete?: (sensor: CalibrationSensor, auditId: string) => void }) {
  const [sensors, setSensors] = useState<Record<CalibrationSensor, SensorCalibrationState> | null>(null)
  const [activeSensor, setActiveSensor] = useState<CalibrationSensor | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [committing, setCommitting] = useState(false)
  const operatorId = 'SGP-OPS-001'

  useEffect(() => {
    fetch('/api/atlas/ardupilot/calibration').then(r=>r.json()).then(j => setSensors(j.data.sensors))
  }, [])

  const advance = async () => {
    setAdvancing(true)
    const j = await fetch('/api/atlas/ardupilot/calibration', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sensor: activeSensor, action:'advance', operator_id: operatorId })
    }).then(r=>r.json())
    setSensors(prev => prev ? { ...prev, [activeSensor!]: j.data } : prev)
    setAdvancing(false)
  }
  const commit = async () => {
    setCommitting(true)
    const j = await fetch('/api/atlas/ardupilot/calibration', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sensor: activeSensor, action:'commit', operator_id: operatorId })
    }).then(r=>r.json())
    setSensors(prev => prev ? { ...prev, [activeSensor!]: j.data } : prev)
    onComplete?.(activeSensor!, j.data.audit_id)
    setCommitting(false)
  }
  const abort = async () => {
    const j = await fetch('/api/atlas/ardupilot/calibration', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sensor: activeSensor, action:'abort', operator_id: operatorId })
    }).then(r=>r.json())
    setSensors(prev => prev ? { ...prev, [activeSensor!]: j.data } : prev)
    setActiveSensor(null)
  }

  return (
    <div className="flex w-full" style={{ minHeight: 420 }}>
      {/* Sidebar */}
      <div className="flex flex-col" style={{ width: 280, borderRight: '1px solid #e5e7eb', background: '#18181b' }}>
        {sensors && Object.values(sensors).map(sensor => (
          <div key={sensor.sensor} className={cn("flex flex-col px-4 py-2 cursor-pointer group", activeSensor === sensor.sensor && "border-l-2", "transition-all")}
            style={{ borderLeft: activeSensor === sensor.sensor ? '2px solid #22d3ee' : undefined, background: activeSensor === sensor.sensor ? '#23272e' : undefined }}
            onClick={() => setActiveSensor(sensor.sensor)}>
            <div className="flex items-center gap-2">
              <span>{SENSOR_ICONS[sensor.sensor]}</span>
              <span className="font-semibold text-base">{sensor.sensor.charAt(0).toUpperCase() + sensor.sensor.slice(1)}</span>
              <span className="ml-auto"><Badge style={{ background: getConfidenceColor(sensor.confidence), color: '#fff' }}>{(sensor.confidence*100).toFixed(0)}%</Badge></span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span>Last: {sensor.last_calibrated ? new Date(sensor.last_calibrated).toLocaleDateString() : '—'}</span>
              <span className="ml-auto" style={{ background: getStatusColor(sensor.step), color: '#fff', borderRadius: 8, padding: '0 8px', fontSize: 12 }}>{sensor.step.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Main Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {activeSensor && sensors && (
          <>
            <div className="w-full max-w-xl bg-[#23272e] rounded-lg shadow p-8 relative">
              <div className="flex items-center gap-4 mb-2">
                <span className="font-bold text-lg">CALIBRATE {activeSensor.toUpperCase()}</span>
                <span className="ml-auto text-sm">Step {sensors[activeSensor].step_index+1} / {sensors[activeSensor].total_steps}</span>
              </div>
              <div className="flex flex-col items-center mb-4">
                <div className="flex flex-col items-center justify-center" style={{ width:96, height:96, background:'#fff', borderRadius:48, marginBottom:8 }}>
                  <span style={{ fontSize:72 }}>{STEP_ILLUSTRATIONS[sensors[activeSensor].step].emoji}</span>
                </div>
                <div className="text-base font-semibold mb-2">{STEP_ILLUSTRATIONS[sensors[activeSensor].step].label}</div>
                <div className="text-sm text-gray-300 mb-2" style={{ maxWidth:400, textAlign:'center' }}>
                  {sensors[activeSensor].step.replace('_',' ')} — follow instructions.
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full mb-2">
                <div className="h-2 rounded bg-gray-700 relative">
                  <div className="h-2 rounded" style={{ width: `${((sensors[activeSensor].step_index+1)/sensors[activeSensor].total_steps)*100}%`, background: getConfidenceColor(sensors[activeSensor].confidence), transition:'width 0.3s' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Step {sensors[activeSensor].step_index+1}</span>
                  <span>Total {sensors[activeSensor].total_steps}</span>
                </div>
              </div>
              {/* Confidence Bar */}
              <div className="w-full mb-2">
                <div className="h-2 rounded bg-gray-700 relative">
                  <div className="h-2 rounded" style={{ width: `${(sensors[activeSensor].confidence)*100}%`, background: getConfidenceColor(sensors[activeSensor].confidence), transition:'width 0.3s' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Confidence</span>
                  <span>{(sensors[activeSensor].confidence*100).toFixed(1)}%</span>
                </div>
              </div>
              {/* Offsets */}
              {sensors[activeSensor].offsets && (
                <div className="flex gap-4 items-center mb-2 font-mono">
                  <span>X: <span style={{ color: Math.abs(sensors[activeSensor].offsets.x)<0.02?'#3fb950':Math.abs(sensors[activeSensor].offsets.x)<0.1?'#f59e0b':'#f85149' }}>{sensors[activeSensor].offsets.x.toFixed(4)}</span></span>
                  <span>Y: <span style={{ color: Math.abs(sensors[activeSensor].offsets.y)<0.02?'#3fb950':Math.abs(sensors[activeSensor].offsets.y)<0.1?'#f59e0b':'#f85149' }}>{sensors[activeSensor].offsets.y.toFixed(4)}</span></span>
                  <span>Z: <span style={{ color: Math.abs(sensors[activeSensor].offsets.z)<0.02?'#3fb950':Math.abs(sensors[activeSensor].offsets.z)<0.1?'#f59e0b':'#f85149' }}>{sensors[activeSensor].offsets.z.toFixed(4)}</span></span>
                </div>
              )}
              {sensors[activeSensor].temperature_c && (
                <div className="text-xs mb-2">TEMPERATURE: {sensors[activeSensor].temperature_c.toFixed(1)}°C</div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button onClick={advance} disabled={advancing || sensors[activeSensor].step==='complete'}>ADVANCE</Button>
                {(sensors[activeSensor].step==='computing'||sensors[activeSensor].step_index>=sensors[activeSensor].total_steps-1) && (
                  <Button onClick={commit} disabled={committing}>COMMIT</Button>
                )}
                <Button variant="outline" onClick={abort}>ABORT</Button>
                <Button variant="ghost" onClick={()=>setActiveSensor(null)}>DONE</Button>
              </div>
              {/* Audit Info */}
              <div className="text-xs mt-4">AUDIT: {sensors[activeSensor].audit_id ?? '—'} TOKEN: {sensors[activeSensor].hmac_token?.slice(0,8) ?? '—'}</div>
              {/* Complete Overlay */}
              {sensors[activeSensor].step==='complete' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg z-10">
                  <div className="text-5xl mb-2">✅</div>
                  <div className="font-bold text-lg mb-2">CALIBRATION COMPLETE</div>
                  <div className="text-xs mb-2">AUDIT ID: {sensors[activeSensor].audit_id}</div>
                  <Button onClick={()=>setActiveSensor(null)}>CALIBRATE NEXT SENSOR</Button>
                </div>
              )}
            </div>
          </>
        )}
        {!activeSensor && (
          <div className="text-gray-400 mt-16">Select a sensor to calibrate.</div>
        )}
      </div>
    </div>
  )
}