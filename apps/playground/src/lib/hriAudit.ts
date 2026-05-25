import { HriSessionRepository } from 'audit-events/repositories/hriSessionRepository';
import type { HriSessionData } from './HriSessionData';
import { LearningEventRepository } from 'audit-events/repositories/learningEventRepository';

const hriSessionRepo = new HriSessionRepository();
const learningRepo = new LearningEventRepository();

export async function startHriSession(data: any) {
  return hriSessionRepo.createSession(data);
}

export async function startHriSessionTyped(data: HriSessionData) {
  return hriSessionRepo.createSession(data);
}

export async function appendTimelineEvent(sessionId: string, event: Record<string, unknown>) {
}

export async function recordRecommendation(sessionId: string, recommendation: Record<string, unknown>) {
}

export async function recordOperatorDecision(sessionId: string, decision: Record<string, unknown>) {
}
