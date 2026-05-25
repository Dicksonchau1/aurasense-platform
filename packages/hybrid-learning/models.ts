// Domain models for hybrid learning
import { AdaptationTrace, Envelope, AuditEvent } from 'nepa-substrate';

export type LearningChannel = 'hri_feedback' | 'world_model' | 'stdp' | 'simulation_outcome';

export interface LearningEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  channel: LearningChannel;
  payload: any;
}

export interface AdaptationCandidate {
  event: LearningEvent;
  normalized: any;
  source: LearningChannel;
}

export interface AdaptationDecision {
  candidate: AdaptationCandidate;
  decision: 'accept' | 'reject' | 'defer';
  rationale: string;
  score: number;
}

// AdaptationTrace, Envelope, AuditEvent now imported from nepa-substrate

export interface RecommendationWeightUpdate {
  recommendationId: string;
  delta: number;
  reason: string;
}

export interface TrustThresholdUpdate {
  threshold: number;
  reason: string;
}

export interface StdpAssociationUpdate {
  associationId: string;
  delta: number;
  reason: string;
}
