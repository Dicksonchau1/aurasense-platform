
import { HriSessionRepository } from 'audit-events/repositories/hriSessionRepository';

const hriSessionRepo = new HriSessionRepository();

export async function fetchSessions(params: any) {
  return hriSessionRepo.listSessions(params);
}

export async function fetchTimelineBySession(sessionId: string) {

}

export async function fetchTrustReceipts(sessionId: string) {

}

export async function fetchPolicyReceipts(sessionId: string) {

}
