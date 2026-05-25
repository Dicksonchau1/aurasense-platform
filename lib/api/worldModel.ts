// World Model API hooks
import axios from 'axios';

const BASE = '/api/world-model';

export async function getWorldState() {
  const res = await axios.get(`${BASE}/state`);
  return res.data;
}

export async function getWorldHistory() {
  const res = await axios.get(`${BASE}/history`);
  return res.data;
}

export async function getWorldPredictions() {
  const res = await axios.get(`${BASE}/predictions`);
  return res.data;
}

export async function simulateWorld(payload: any) {
  const res = await axios.post(`${BASE}/simulate`, payload);
  return res.data;
}

export async function getWorldHealth() {
  const res = await axios.get(`${BASE}/health`);
  return res.data;
}
