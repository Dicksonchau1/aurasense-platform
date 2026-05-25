// backend/app/substrateServer.ts
// NEPA runtime substrate server — exposes singleton run_id and substrate HTTP API

import express from 'express';
import { v4 as uuidv4 } from 'uuid';


const app = express();
app.use(express.json());
const PORT = process.env.SUBSTRATE_PORT ? parseInt(process.env.SUBSTRATE_PORT) : 4001;

// Singleton run_id for this process
const run_id = uuidv4();


// Health endpoint for substrate client
app.get('/substrate/health', (req, res) => {
  res.json({ run_id, status: 'online' });
});

// Step endpoint for substrate client (accepts envelope array)
app.post('/substrate/step', (req, res) => {
  const { envelope } = req.body;
  // For now, echo the envelope and a dummy result
  res.json({ result: 'ok', envelope });
});

// Existing run_id endpoint (optional, for debugging)
app.get('/substrate/run_id', (req, res) => {
  res.json({ run_id });
});

app.listen(PORT, () => {
  console.log(`[substrateServer] Listening on http://localhost:${PORT}`);
  console.log(`[substrateServer] Singleton run_id: ${run_id}`);
});
