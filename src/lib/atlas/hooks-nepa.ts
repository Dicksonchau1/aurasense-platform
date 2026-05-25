import { useEffect, useState } from 'react'
import type { StdpSnapshot } from '@/types/atlas'

/**
 * useStdpSnapshot - Fetches live STDP stats from the NEPA API.
 * Returns { data, loading, error }.
 */
export function useStdpSnapshot() {
  const [data, setData] = useState<StdpSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/nepa/stdp/snapshot')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch STDP snapshot')
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