import { NextResponse } from 'next/server'
import { subscribe } from '../../../../../lib/runtime/anomaly-bus'
import { ingestAnomalyEvent, getAllTracks } from '../../../../../lib/atlas/threat-store'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  let closed = false
  function send(data: string) {
    writer.write(new TextEncoder().encode(data))
  }
  // Heartbeat every 25s
  const heartbeat = setInterval(() => {
    if (!closed) send(': ping\n\n')
  }, 25000)
  // Subscribe to anomaly bus
  const unsub = subscribe('*', (evt: any) => {
    const track = ingestAnomalyEvent(evt)
    if (track) {
      send(`event: track_update\ndata: ${JSON.stringify(track)}\n\n`)
    }
  })
  req.signal.addEventListener('abort', () => {
    closed = true
    clearInterval(heartbeat)
    unsub()
    writer.close()
  })
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
