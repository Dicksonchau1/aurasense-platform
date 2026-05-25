import { useEffect, useState } from 'react'

export interface ArduPilotLinkStatus {
  connected: boolean
  vehicle_id: string
  last_heartbeat: number
  rssi: number
  voltage: number
}

export interface ArduPilotMode {
  mode: string
  active: boolean
}

export interface ArduPilotCalibrationStatus {
  in_progress: boolean
  step: string
  progress: number
}

export function useArduPilotLink() {
  const [data, setData] = useState<ArduPilotLinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/ardupilot/link')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch link status'); return r.json(); })
      .then(json => { if (!alive) return; setData(json?.data ?? null); setLoading(false); })
      .catch(e => { if (!alive) return; setError(e.message || 'Unknown error'); setLoading(false); })
    return () => { alive = false }
  }, [])
  return { data, loading, error }
}

export function useArduPilotModes() {
  const [data, setData] = useState<ArduPilotMode[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/ardupilot/mode')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch modes'); return r.json(); })
      .then(json => { if (!alive) return; setData(json?.data?.modes ?? null); setLoading(false); })
      .catch(e => { if (!alive) return; setError(e.message || 'Unknown error'); setLoading(false); })
    return () => { alive = false }
  }, [])
  return { data, loading, error }
}

export function useArduPilotCalibration() {
  const [data, setData] = useState<ArduPilotCalibrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/ardupilot/calibrate')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch calibration status'); return r.json(); })
      .then(json => { if (!alive) return; setData(json?.data ?? null); setLoading(false); })
      .catch(e => { if (!alive) return; setError(e.message || 'Unknown error'); setLoading(false); })
    return () => { alive = false }
  }, [])
  return { data, loading, error }
}
