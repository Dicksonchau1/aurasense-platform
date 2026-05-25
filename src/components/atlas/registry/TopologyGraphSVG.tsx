'use client';

import React, { useState } from "react"
import type { TopologyGraph } from "../../../types/atlas"
import NodePopover from "./NodePopover"

interface TopologyGraphSVGProps {
  graph: TopologyGraph
}

export default function TopologyGraphSVG({ graph }: TopologyGraphSVGProps) {
  const w = 800, h = 400
  const nodeRadius = 18
  const nodes = graph.nodes.map((n: any, i: number) => ({ ...n, x: 100 + (i % 6) * 110, y: 80 + Math.floor(i / 6) * 120 }))
  const nodeMap: Record<string, any> = Object.fromEntries(nodes.map((n: any) => [n.id, n]))

  const [popover, setPopover] = useState<{ node: any, anchor: { x: number, y: number } } | null>(null)

  const handleNodeClick = (n: any) => setPopover({ node: n, anchor: { x: n.x, y: n.y } })
  const handleClosePopover = () => setPopover(null)

  return (
    <svg width={w} height={h} style={{ background: '#0a0e15', borderRadius: 12, width: '100%', height: 400 }}>
      {graph.edges.map((e: any, i: number) => {
        const a = nodeMap[e.source_id], b = nodeMap[e.target_id]
        if (!a || !b) return null
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#22d3ee" strokeWidth={1.5} opacity={0.7} />
      })}
      {nodes.map((n: any) => (
        <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(n)}>
          <circle cx={n.x} cy={n.y} r={nodeRadius} fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth={2} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fill="#fff">{n.id}</text>
        </g>
      ))}
      {popover && (<NodePopover open={!!popover} anchor={popover.anchor} node={popover.node} onClose={handleClosePopover} />)}
    </svg>
  )
}
