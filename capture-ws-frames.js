// Node.js script to capture the first 3 websocket frames from ws://127.0.0.1:3001/rehearse/drone
// Usage: node capture-ws-frames.js

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:3001/rehearse/drone');
let count = 0;

ws.on('open', () => {
  console.log('Connected. Waiting for frames...');
});

ws.on('message', (data) => {
  count++;
  console.log(`\n--- Frame ${count} ---\n${data.toString()}`);
  if (count >= 3) {
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
  process.exit(1);
});
