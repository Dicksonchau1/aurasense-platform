"""
Envelope and EnvelopeStream: Message-passing boundary.
"""
from typing import Any, List, Callable, Dict
from dataclasses import dataclass, field
import uuid

@dataclass
class Envelope:
    session_id: str
    timestamp: float
    payload: Any
    trust_level: float
    policy_refs: List[str]

class EnvelopeStream:
    def __init__(self):
        self._handlers: Dict[str, Callable[[Envelope], None]] = {}

    def push(self, envelope: Envelope) -> None:
        for handler in self._handlers.values():
            handler(envelope)

    def subscribe(self, handler: Callable[[Envelope], None]) -> str:
        sub_id = str(uuid.uuid4())
        self._handlers[sub_id] = handler
        return sub_id

    def unsubscribe(self, subscription_id: str) -> None:
        if subscription_id in self._handlers:
            del self._handlers[subscription_id]
