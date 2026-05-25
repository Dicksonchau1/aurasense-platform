// ops/orchestrator-ws-server.ts
// Standalone Node WebSocket server bridging SceneController to browser clients.
// PR D-3 (2026-05-23)

import { WebSocketServer } from 'ws';
import { getSceneController } from '../src/lib/scene/SceneController';

const PORT = Number(process.env.ORCHESTRATOR_WS_PORT ?? 3001);
const PATH = '/rehearse/drone';

const wss = new WebSocketServer({ port: PORT, path: PATH });
const controller = getSceneController();

let connectionCount = 0;
let messageCount = 0;

wss.on('connection', (ws, req) => {
  connectionCount += 1;
  const id = connectionCount;
  console.log(
    `[ws] client #${id} connected from ${req.socket.remoteAddress} (total: ${controller.clientCount() + 1})`
  );
  controller.attachClient(ws);

  ws.on('message', (data) => {
    messageCount += 1;
    // Browser clients are read-only consumers in v1. Log unexpected sends.
    if (messageCount % 50 === 0) {
      console.log(`[ws] inbound message count: ${messageCount}`);
    }
  });

  ws.on('close', () => {
    console.log(`[ws] client #${id} disconnected`);
  });

  ws.on('error', (err) => {
    console.error(`[ws] client #${id} error:`, err.message);
  });
});

console.log(
  `[ws] orchestrator WebSocket server listening on ws://127.0.0.1:${PORT}${PATH}`
);

process.on('SIGINT', () => {
  console.log('[ws] shutting down');
  wss.close(() => process.exit(0));
});

export { controller };
