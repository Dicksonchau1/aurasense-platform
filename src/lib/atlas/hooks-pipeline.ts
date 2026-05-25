import { useEffect, useState } from 'react'

export interface PipelineStage {
  n: number
  name: string
  status: string
  throughput_hz: number
  latency_ms: number
}

export interface PipelineStatus {
  stages: PipelineStage[]
  total_latency_ms: number
}

export function usePipelineStatus() {
  const [data, setData] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/nepa/pipeline/live')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch pipeline status')
        return r.json()
      })
      .then(json => {
        if (!alive) return
        setData(json?.data ?? null)
        setLoading(false)
      })
      .catch(e => {
        if (!alive) return
        setError(e.message || 'Unknown error')
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  return { data, loading, error }
}
