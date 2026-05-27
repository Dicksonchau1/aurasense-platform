from collections import defaultdict
from typing import AsyncIterator, Optional
from .tuple_schema import RawAuditEvent, LearningTuple
from .reward_calculator import RewardCalculator
from .feature_extractor import FeatureExtractor

DECISION_EVENT_TYPES = {
    "MISSION_ASSIGNED",
    "GO_TO_CHARGE_ISSUED",
    "REQUEST_SERVICE_ISSUED",
    "SKILL_DEPLOYED",
    "MISSION_PREEMPTED",
    "MISSION_REROUTED",
}

OUTCOME_EVENT_TYPES = {
    "MISSION_COMPLETED",
    "MISSION_FAILED",
    "POST_SWAP_VERIFIED",
    "POST_SERVICE_VERIFIED",
    "SLA_BREACHED",
    "EMERGENCY_STOP_FIRED",
}

class TupleAssembler:
    """Stateful streaming assembler that pairs decision events with
    their eventual outcome events, computes rewards, and emits
    LearningTuple objects ready for the replay buffer.

    Pairing is correlation_id-based when present, robot_id+ts-window
    based as fallback. Tuples that don't see an outcome within
    max_horizon_s are emitted with is_terminal=True and a timeout
    reward (small negative, calibrated to discourage scheduling
    actions that vanish from observability)."""

    def __init__(
        self,
        reward_calc: RewardCalculator,
        features: FeatureExtractor,
        max_horizon_s: float = 1800.0,
    ):
        self.reward_calc = reward_calc
        self.features = features
        self.max_horizon_s = max_horizon_s
        self.pending: dict[str, RawAuditEvent] = {}

    async def process(self, stream: AsyncIterator[RawAuditEvent]
                      ) -> AsyncIterator[LearningTuple]:
        async for event in stream:
            if event.event_type in DECISION_EVENT_TYPES:
                self.pending[self._key(event)] = event
            elif event.event_type in OUTCOME_EVENT_TYPES:
                decision = self._find_match(event)
                if decision is not None:
                    tup = await self._build_tuple(decision, event)
                    if tup is not None:
                        yield tup
            await self._sweep_timeouts(event.ts)

    def _key(self, e: RawAuditEvent) -> str:
        cid = e.payload.get("correlationId")
        return cid if cid else f"{e.payload.get('robotId','?')}::{e.ts.timestamp()}"

    def _find_match(self, outcome: RawAuditEvent) -> Optional[RawAuditEvent]:
        cid = outcome.payload.get("correlationId")
        if cid and cid in self.pending:
            return self.pending.pop(cid)
        robot = outcome.payload.get("robotId")
        if robot is None:
            return None
        candidates = [k for k, v in self.pending.items()
                      if v.payload.get("robotId") == robot]
        if not candidates:
            return None
        candidates.sort(
            key=lambda k: abs((outcome.ts - self.pending[k].ts).total_seconds())
        )
        return self.pending.pop(candidates[0])

    async def _build_tuple(self, decision: RawAuditEvent,
                           outcome: RawAuditEvent) -> Optional[LearningTuple]:
        state_features = await self.features.from_state_hash(
            decision.payload.get("stateHash"))
        next_state_features = await self.features.from_state_hash(
            outcome.payload.get("stateHash"))
        if state_features is None or next_state_features is None:
            return None
        action_features = self.features.from_action(decision.payload)
        reward, components = self.reward_calc.compute(decision, outcome)
        horizon = (outcome.ts - decision.ts).total_seconds()
        return LearningTuple(
            tuple_id=f"{decision.event_id}_{outcome.event_id}",
            tenant_id=decision.tenant_id,
            site_id=decision.payload.get("siteId", "default"),
            decision_event_id=decision.event_id,
            outcome_event_id=outcome.event_id,
            state_hash=decision.payload.get("stateHash", ""),
            state_features=state_features,
            action_id=decision.payload.get("actionId", decision.event_type),
            action_features=action_features,
            alternatives_considered=decision.payload.get("alternativesConsidered", []),
            reward=reward,
            reward_components=components,
            next_state_features=next_state_features,
            horizon_seconds=horizon,
            is_terminal=outcome.event_type
                in {"MISSION_FAILED", "EMERGENCY_STOP_FIRED", "SLA_BREACHED"},
            decision_ts=decision.ts,
            outcome_ts=outcome.ts,
            chain_window_hash=outcome.chain_hash,
        )

    async def _sweep_timeouts(self, now) -> None:
        expired = [k for k, e in self.pending.items()
                   if (now - e.ts).total_seconds() > self.max_horizon_s]
        for k in expired:
            self.pending.pop(k)
