"use client"
import React, { useEffect, useState, useRef } from "react"
import { ArdupilotLog, LogReplayFrame } from '@/src/types/ardupilot'
import { Button } from "@/components/ui/button"

export default function LogReplaySection(props: any) {
  const [logs, setLogs] = useState<ArdupilotLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [frames, setFrames] = useState<LogReplayFrame[]>([])
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [maxTime, setMaxTime] = useState(100000)
  const [cursorTime, setCursorTime] = useState(0)
  const [playbackState, setPlaybackState] = useState<'playing'|'paused'|'stopped'>('stopped')
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fetchingFrames, setFetchingFrames] = useState(false)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    fetch('/api/atlas/ardupilot/logs').then(r=>r.json()).then(j => {
      setLogs(j.data.logs)
      setLoadingLogs(false)
    })
  }, [])

  useEffect(() => {
    if (selectedLog) {
      const log = logs.find(l=>l.id===selectedLog)
      if (log) setMaxTime(log.duration_s*1000)
      fetch(`/api/atlas/ardupilot/logs/${selectedLog}/replay?ts_ms=0&window_ms=10000`).then(r=>r.json()).then(j => setFrames(j.data.frames))
      setCursorTime(0)
      setPlaybackState('stopped')
    }
  }, [selectedLog])

  useEffect(() => {
    if (playbackState==='playing') {
      intervalRef.current = setInterval(()=>{
        setCursorTime(t=>{
          if (t+100>=maxTime) {
            setPlaybackState('stopped'); return maxTime
          }
          return t+100*playbackRate
        })
      }, 100/playbackRate)
    } else {
      clearInterval(intervalRef.current)
    }
    return ()=>clearInterval(intervalRef.current)
  }, [playbackState, playbackRate, maxTime])

  useEffect(() => {
    if (selectedLog && frames.length && cursorTime > frames[frames.length-1].ts_ms) {
      setFetchingFrames(true)
      fetch(`/api/atlas/ardupilot/logs/${selectedLog}/replay?ts_ms=${cursorTime}&window_ms=5000`).then(r=>r.json()).then(j => {
        setFrames(prev => [...prev, ...j.data.frames])
        setFetchingFrames(false)
      })
    }
  }, [cursorTime, selectedLog, frames])

  const currentFrame = frames.find(f=>f.ts_ms>=cursorTime) || frames[frames.length-1]

  return (
    <div className="w-full flex flex-col items-center p-8">
      <div className="w-full max-w-2xl mb-4">
        <select className="w-full p-2 rounded bg-gray-900 border mb-2" value={selectedLog||''} onChange={e=>setSelectedLog(e.target.value)}>
          <option value="">Select a log…</option>
          {logs.map(log=>(
            <option key={log.id} value={log.id}>
              {log.filename} — {log.vehicle_id} — {log.duration_s}s — {log.anomaly_count} anomalies {log.has_anomalies?'*':''}
            </option>
          ))}
        </select>
      </div>
      {selectedLog && (
        <div className="w-full max-w-2xl bg-[#23272e] rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-2">
            <Button onClick={()=>setPlaybackState('playing')} disabled={playbackState==='playing'}>PLAY ▶</Button>
            <Button onClick={()=>setPlaybackState('paused')} disabled={playbackState!=='playing'}>PAUSE ⏸</Button>
            <Button onClick={()=>setCursorTime(t=>Math.max(0,t-1000))}>◀◀ -1s</Button>
            <Button onClick={()=>setCursorTime(t=>Math.min(maxTime,t+1000))}>+1s ▶▶</Button>
            <span>RATE:</span>
            {[0.5,1,2,4].map(r=>(<Button key={r} size="sm" variant={playbackRate===r?"default":"outline"} onClick={()=>setPlaybackRate(r)}>{r}×</Button>))}
            <span>{Math.floor(cursorTime/60000)}m {Math.floor((cursorTime%60000)/1000)}s / {Math.floor(maxTime/60000)}m {Math.floor((maxTime%60000)/1000)}s</span>
          </div>
          {/* Scrub Bar */}
          <div className="relative w-full h-4 bg-gray-700 rounded mb-2" style={{ cursor:'pointer' }}
            onClick={e=>{
              const rect = (e.target as HTMLDivElement).getBoundingClientRect()
              const pct = (e.clientX-rect.left)/rect.width
              setCursorTime(Math.floor(pct*maxTime))
            }}>
            <div className="absolute top-0 left-0 h-4 bg-cyan-400 rounded" style={{ width: `${(cursorTime/maxTime)*100}%`, transition:'width 0.2s' }}></div>
            {/* Anomaly markers */}
            {frames.filter(f=>f.anomaly_flag).map(f=>(
              <div key={f.ts_ms} style={{position:'absolute', left:`${(f.ts_ms/maxTime)*100}%`, top:'-4px', color:'#f85149', fontSize:'8px'}}>◆</div>
            ))}
          </div>
          {/* Telemetry Strip */}
          {currentFrame && (
            <div className="flex items-center gap-4 mt-2">
              <span>ROLL: {currentFrame.attitude.roll.toFixed(1)}°</span>
              <span>PITCH: {currentFrame.attitude.pitch.toFixed(1)}°</span>
              <span>YAW: {currentFrame.attitude.yaw.toFixed(0)}°</span>
              <span>ALT: {currentFrame.position.alt_m.toFixed(1)}m</span>
              <span>BATT: {currentFrame.battery.remaining_pct.toFixed(0)}%</span>
              <span>VX: {currentFrame.velocity.vx.toFixed(1)}</span>
              <span>VY: {currentFrame.velocity.vy.toFixed(1)}</span>
              {/* Attitude Indicator */}
              <svg width={80} height={80} style={{ background:'#222', borderRadius:40 }}>
                <g transform={`rotate(${currentFrame.attitude.roll}, 40, 40)`}>
                  <rect x={0} y={40+(currentFrame.attitude.pitch/90)*40} width={80} height={40-(currentFrame.attitude.pitch/90)*40} fill="#38bdf8" />
                  <rect x={0} y={0} width={80} height={40+(currentFrame.attitude.pitch/90)*40} fill="#a16207" />
                  <line x1={0} y1={40+(currentFrame.attitude.pitch/90)*40} x2={80} y2={40+(currentFrame.attitude.pitch/90)*40} stroke="#fff" strokeWidth={2} />
                </g>
              </svg>
            </div>
          )}
          {/* Event Timeline (stub) */}
          <div className="mt-4 text-xs text-gray-400">Event Timeline (not implemented in this stub)</div>
        </div>
      )}
      {!selectedLog && !loadingLogs && <div className="text-gray-400 mt-16">Select a log to replay.</div>}
    </div>
  )
}