# WOUND_CARE_IMPLEMENTATION_PLAN.md

## Clinical Session Lifecycle

A wound dressing rehearsal session follows this lifecycle:

1. **START**: Session begins, session.start event emitted.
2. **STEP_SEQUENCE**: Five wound dressing steps are performed in order, each requiring confirmation.
3. **ASSESSMENT**: Each step is scored after confirmation (smoke mode: always pass).
4. **COMPLETE**: After all steps, a final assessment and session.complete event are emitted.

## Discriminated Event Types

1. **session.start**: Indicates the session has started.
2. **step.advance**: Emitted for each step, includes step_index, step_name, expected_action.
3. **step.error**: Emitted if an error occurs during a step.
4. **assessment.score**: Emitted after each step is confirmed, includes score.
5. **session.complete**: Emitted after all steps, includes passed: bool, total_score, max_score.
6. **session.replay**: Emitted if the session is replayed (restarted with same sessionId).

## WebSocket Route Path

- `ws://host/ws/rehearse/wound-dressing/{sessionId}`

## Completion Criteria

- All 5 steps are scored (assessment.score emitted per step)
- Final assessment emitted
- session.complete event emitted with payload: `{ passed: bool, total_score: float, max_score: float }`

## Audit Trail Schema

Each event is logged with the following schema:

- `timestamp`: ISO8601 string
- `event_type`: string (one of the 6 types above)
- `payload`: object (event-specific data)
- `session_id`: string

---

This plan governs the backend implementation and test acceptance for the wound dressing rehearsal session WebSocket route.
