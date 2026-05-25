"""
AuditEvent: Substrate-level audit event, compatible with audit-events package.
"""
from typing import Optional
from dataclasses import dataclass

@dataclass
class AuditEvent:
    event_id: str
    session_id: str
    event_type: str
    channel: str
    payload: dict
    timestamp: float
    agent_id: str
    operator_id: Optional[str] = None
