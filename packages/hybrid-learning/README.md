# Hybrid Learning Package

Implements the hybrid learning spine for NEPA agents, integrating HRI/audit events, world-model reasoning, and neuromorphic adaptation traces. Provides event-driven ingestion, processing, scoring, and traceability for explainable adaptation.


## Main Concepts

- **LearningEvent**: Unified event for learning/adaptation.
- **LearningChannel**: Source of learning (HRI, world-model, STDP, simulation).
- **AdaptationCandidate**: Normalized candidate for adaptation.
- **AdaptationDecision**: Result of scoring/advisory process.
- **AdaptationTrace**: Persisted trace of adaptation.
- **RecommendationWeightUpdate**: Change in recommendation ranking.
- **TrustThresholdUpdate**: Change in trust/intervention threshold.
- **StdpAssociationUpdate**: Change in neuromorphic association.


## Public APIs

- `ingestLearningEvent(event)`
- `getAdaptationCandidates(sessionId)`
- `scoreAdaptationCandidates(candidates)`
- `replaySession(sessionId)`
- `getAdaptationTraces(sessionId)`


## Integration

- **apps/playground**: Replay/inspection panel, timeline, candidate/adaptation trace display.
- **apps/atlas**: Read-only trust threshold, recommendation provenance, baseline/adapted status.


## Adapters

- `WorldModelAdapter` (uses `packages/world-model-client`)
- `StdpTraceAdapter` (uses `packages/stdp-debug`)


## Principles

- Event-driven, deterministic, explainable, advisory-first.
- No direct UI imports in core logic.
- No hidden mutation of critical policies.
