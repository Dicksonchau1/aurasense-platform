// Scoring engine for adaptation candidates
import { AdaptationCandidate, AdaptationDecision } from './models';
import { processHriFeedback, processWorldModel, processStdpTrace } from './processors';

export function scoreAdaptationCandidates(candidates: AdaptationCandidate[]): AdaptationDecision[] {
  return candidates.map(candidate => {
    switch (candidate.source) {
      case 'hri_feedback':
        return processHriFeedback(candidate);
      case 'world_model':
        return processWorldModel(candidate);
      case 'stdp':
        return processStdpTrace(candidate);
      default:
        return {
          candidate,
          decision: 'defer',
          rationale: 'Unknown source',
          score: 0,
        };
    }
  });
}
