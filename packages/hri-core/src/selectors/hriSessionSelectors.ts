import { HriSessionState } from '../types/HriSessionState';
import { AgentRecommendation } from '../types/AgentRecommendation';
import { OperatorAction } from '../types/OperatorAction';
import { TrustEnvelope } from '../types/TrustEnvelope';
import { HriTimelineEvent } from '../types/HriTimelineEvent';

export function getCurrentRecommendation(state: HriSessionState): AgentRecommendation | undefined {
  return state.currentRecommendation;
}

export function getOutstandingHumanAction(state: HriSessionState): OperatorAction | undefined {
  return state.outstandingHumanAction;
}

export function getTrustState(state: HriSessionState): TrustEnvelope | undefined {
  return state.trustEnvelope;
}

export function getSessionTimeline(state: HriSessionState): HriTimelineEvent[] {
  return state.timeline;
}

export function getCompletionState(state: HriSessionState): 'completed' | 'failed' | 'active' {
  if (state.status === 'completed') return 'completed';
  if (state.status === 'failed') return 'failed';
  return 'active';
}
