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
export interface AdaptationTrace {
    id: string;
    sessionId: string;
    candidate: AdaptationCandidate;
    decision: AdaptationDecision;
    timestamp: number;
}
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
//# sourceMappingURL=models.d.ts.map