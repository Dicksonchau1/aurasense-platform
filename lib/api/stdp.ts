// STDP API hooks
import axios from 'axios';

const BASE = '/api/v1/stdp';

export async function submitFeedback(feedback: any) {
  const res = await axios.post(`${BASE}/feedback`, feedback);
  return res.data;
}

export async function listFeedback() {
  const res = await axios.get(`${BASE}/feedback`);
  return res.data;
}

export async function retrainModel() {
  const res = await axios.post(`${BASE}/retrain`);
  return res.data;
}

export async function getMetrics() {
  const res = await axios.get(`${BASE}/metrics`);
  return res.data;
}
