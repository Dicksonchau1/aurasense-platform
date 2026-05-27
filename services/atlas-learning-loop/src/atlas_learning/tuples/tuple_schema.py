from pydantic import BaseModel
from typing import Any
from datetime import datetime

class RawAuditEvent(BaseModel):
    event_id: str
    ts: datetime
    tenant_id: str
    source_module: str
    event_type: str
    payload: dict
    chain_hash: str

    @classmethod
    def from_row(cls, row) -> "RawAuditEvent":
        return cls(**dict(row))

class LearningTuple(BaseModel):
    """A single (state, action, reward, next_state) transition assembled
    from the audit chain. The fundamental unit of continuous learning."""
    tuple_id: str
    tenant_id: str
    site_id: str
    decision_event_id: str
    outcome_event_id: str
    state_hash: str
    state_features: list[float]
    action_id: str
    action_features: list[float]
    alternatives_considered: list[dict]
    reward: float
    reward_components: dict[str, float]
    next_state_features: list[float]
    horizon_seconds: float
    is_terminal: bool
    decision_ts: datetime
    outcome_ts: datetime
    chain_window_hash: str
