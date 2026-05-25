// Runtime API hooks
import axios from 'axios';

export async function analyzeFrame(payload: any) {
  const res = await axios.post('/nepa/analyze', payload);
  return res.data;
}

export async function getRuntimeHealth() {
  const res = await axios.get('/health');
  return res.data;
}

export async function getRuntimeMetrics() {
  const res = await axios.get('/metrics');
  return res.data;
}

// WebSocket endpoints for live spike data
export function getLiveSpikeStream() {
  return new WebSocket(`${window.location.origin.replace('http', 'ws')}/api/v1/spike/live`);
}

export function getRasterSpikeStream() {
  return new WebSocket(`${window.location.origin.replace('http', 'ws')}/api/v1/spike/raster`);
}
