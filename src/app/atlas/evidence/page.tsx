'use client';

import React, { useEffect, useState } from "react"

interface EvidenceRow {
  id: string
  user_id: string
  created_at: string
  row_hash: string
  prev_hash: string
  canonical_json: string
}

export default function EvidenceChainPage() {
  const [rows, setRows] = useState<EvidenceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Replace with real API endpoint
    fetch("/api/atlas/evidence/chain")
      .then(r => r.json())
      .then(j => {
        setRows(j.data.rows)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-cyan-400">Evidence Chain</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-[#10141a]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#181e29] text-cyan-300">
                <th className="px-4 py-2 text-left">Row Hash</th>
                <th className="px-4 py-2 text-left">Prev Hash</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-gray-800 hover:bg-[#1a2230]">
                  <td className="px-4 py-2 font-mono text-xs text-green-400">{row.row_hash.slice(0, 12)}â€¦</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">{row.prev_hash.slice(0, 12)}â€¦</td>
                  <td className="px-4 py-2">{row.user_id}</td>
                  <td className="px-4 py-2 text-gray-400">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <details>
                      <summary className="cursor-pointer text-cyan-300">View</summary>
                      <pre className="bg-[#181e29] p-2 rounded text-xs text-cyan-100 max-w-xl overflow-x-auto">{row.canonical_json}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
