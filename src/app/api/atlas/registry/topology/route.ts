import { NextResponse } from 'next/server'
import { buildTopologyGraph } from '@/lib/atlas/registry-store'
import { envelope } from '@/lib/nepa'

export async function GET() {
  const graph = buildTopologyGraph()
  return NextResponse.json(envelope(graph, Date.now()))
}
