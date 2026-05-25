// WebSocket event bus for scene events
import type { SceneEvent } from '@/src/lib/rehearse/types';

// Registry of connected sockets by session_id
const sessionSockets: Record<string, Set<WebSocket>> = {};

// Exported broadcast function
export function broadcastSceneEvent(sessionId: string, event: SceneEvent): void {
  const sockets = sessionSockets[sessionId];
  if (sockets) {
    const payload = JSON.stringify(event);
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        ws.send(payload);
      }
    }
  }
}

// WebSocket route handler (Next.js 13+ edge runtime compatible)
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Only handle WebSocket upgrade
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Not a websocket request', { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return new Response('Missing session_id', { status: 400 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  if (!sessionSockets[sessionId]) sessionSockets[sessionId] = new Set();
  sessionSockets[sessionId].add(socket);

  socket.onclose = () => {
    sessionSockets[sessionId].delete(socket);
    if (sessionSockets[sessionId].size === 0) {
      delete sessionSockets[sessionId];
    }
  };
  socket.onmessage = (event) => {
    // Optionally handle pings or client messages
    if (event.data === 'ping') {
      socket.send('pong');
    }
  };
  return response;
}

// If Next.js edge runtime does not support Deno.upgradeWebSocket, replace with the smallest compatible abstraction used elsewhere in the repo and document inline.
