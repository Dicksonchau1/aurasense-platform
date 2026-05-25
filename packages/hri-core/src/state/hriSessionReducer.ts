import { HriSessionState } from '../types/HriSessionState';
import { AgentRecommendation } from '../types/AgentRecommendation';
import { PerceptionSummary } from '../types/PerceptionSummary';
import { OperatorAction } from '../types/OperatorAction';
import { OperatorDecision } from '../types/OperatorDecision';
import { TrustEnvelope } from '../types/TrustEnvelope';
import { PolicyReceiptRef } from '../types/PolicyReceiptRef';
import { InterventionRequest } from '../types/InterventionRequest';
import { HriTimelineEvent } from '../types/HriTimelineEvent';
import { HriSessionStatus } from '../types/HriSessionStatus';
import { HriRole } from '../types/HriRole';

export type HriSessionAction =
  | { type: 'SESSION_STARTED'; payload: { sessionId: string; role: HriRole; startedAt: string } }
  | { type: 'PERCEPTION_UPDATED'; payload: PerceptionSummary }
  | { type: 'RECOMMENDATION_ISSUED'; payload: AgentRecommendation }
  | { type: 'OPERATOR_ACKNOWLEDGED'; payload: OperatorAction }
  | { type: 'OPERATOR_CORRECTED'; payload: OperatorDecision }
  | { type: 'OPERATOR_OVERRIDDEN'; payload: OperatorDecision }
  | { type: 'TRUST_RECEIPT_ATTACHED'; payload: TrustEnvelope }
  | { type: 'POLICY_RECEIPT_ATTACHED'; payload: PolicyReceiptRef }
  | { type: 'SESSION_COMPLETED'; payload: { completedAt: string } }
  | { type: 'SESSION_FAILED'; payload: { failedAt: string } };

export function createHriSessionInitialState(sessionId: string, role: HriRole, startedAt: string): HriSessionState {
  return {
    sessionId,
    status: 'active',
    role,
    timeline: [],
    startedAt,
  };
}

export function hriSessionReducer(state: HriSessionState, action: HriSessionAction): HriSessionState {
  switch (action.type) {
    case 'SESSION_STARTED':
      return createHriSessionInitialState(action.payload.sessionId, action.payload.role, action.payload.startedAt);
    case 'PERCEPTION_UPDATED':
      return { ...state, perception: action.payload, timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'PERCEPTION_UPDATED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'RECOMMENDATION_ISSUED':
      return { ...state, currentRecommendation: action.payload, timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'RECOMMENDATION_ISSUED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'OPERATOR_ACKNOWLEDGED':
      return { ...state, outstandingHumanAction: undefined, operatorDecisions: [...(state.operatorDecisions || []), { decisionId: crypto.randomUUID(), action: action.payload, decision: 'acknowledge', decidedAt: new Date().toISOString() }], timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'OPERATOR_ACKNOWLEDGED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'OPERATOR_CORRECTED':
      return { ...state, outstandingHumanAction: undefined, operatorDecisions: [...(state.operatorDecisions || []), action.payload], timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'OPERATOR_CORRECTED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'OPERATOR_OVERRIDDEN':
      return { ...state, outstandingHumanAction: undefined, operatorDecisions: [...(state.operatorDecisions || []), action.payload], timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'OPERATOR_OVERRIDDEN', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'TRUST_RECEIPT_ATTACHED':
      return { ...state, trustEnvelope: action.payload, timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'TRUST_RECEIPT_ATTACHED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'POLICY_RECEIPT_ATTACHED':
      return { ...state, policyReceipts: [...(state.policyReceipts || []), action.payload], timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'POLICY_RECEIPT_ATTACHED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'SESSION_COMPLETED':
      return { ...state, status: 'completed', completedAt: action.payload.completedAt, timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'SESSION_COMPLETED', payload: action.payload, timestamp: new Date().toISOString() }] };
    case 'SESSION_FAILED':
      return { ...state, status: 'failed', failedAt: action.payload.failedAt, timeline: [...state.timeline, { eventId: crypto.randomUUID(), type: 'SESSION_FAILED', payload: action.payload, timestamp: new Date().toISOString() }] };
    default:
      return state;
  }
}
