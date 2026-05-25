// Learning Loop API hooks
import axios from 'axios';

const BASE = '/api/v1/learning';

export async function startTraining(payload: any) {
  const res = await axios.post(`${BASE}/train`, payload);
  return res.data;
}

export async function listModels() {
  const res = await axios.get(`${BASE}/models`);
  return res.data;
}

export async function promoteModel(modelId: string) {
  const res = await axios.post(`${BASE}/models/${modelId}/promote`);
  return res.data;
}

export async function rollbackModel(modelId: string) {
  const res = await axios.post(`${BASE}/models/${modelId}/rollback`);
  return res.data;
}

export async function getShadowReport() {
  const res = await axios.get(`${BASE}/shadow_report`);
  return res.data;
}
