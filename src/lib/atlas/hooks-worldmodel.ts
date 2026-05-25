import { useEffect, useState } from 'react'
import type { WorldModelSnapshot } from '@/types/atlas'

export function useWorldModelSnapshot() {
  const [data, setData] = useState<WorldModelSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/atlas/nepa/world-model/snapshot')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch world model snapshot')
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
