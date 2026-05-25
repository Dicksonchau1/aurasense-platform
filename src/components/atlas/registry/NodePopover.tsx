import React from "react"

interface NodePopoverProps {
  open: boolean
  anchor: { x: number; y: number } | null
  node: any | null
  onClose: () => void
}

export default function NodePopover({ open, anchor, node, onClose }: NodePopoverProps) {
  if (!open || !anchor || !node) return null
  return (
    <foreignObject x={anchor.x + 20} y={anchor.y - 10} width={320} height={180} style={{ pointerEvents: 'none' }}>
      <div style={{ background: '#181e29', color: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0008', padding: 16, fontSize: 13, minWidth: 220, maxWidth: 320, pointerEvents: 'auto' }}>
        <div style={{ fontWeight: 700, color: '#22d3ee', marginBottom: 6 }}>Node: {node.id}</div>
        <pre style={{ fontSize: 12, color: '#a7f3d0', background: 'none', margin: 0, padding: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(node, null, 2)}</pre>
        <button onClick={onClose} style={{ marginTop: 10, background: '#22d3ee', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Close</button>
      </div>
    </foreignObject>
  )
}
