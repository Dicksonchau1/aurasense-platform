"""
ReflexInterface: Low-latency reactive pathway.
"""
from typing import Any

class ReflexSignal:
    def __init__(self, signal: Any):
        self.signal = signal

class ReflexOutcome:
    def __init__(self, outcome: Any):
        self.outcome = outcome

class ReflexInterface:
    def __init__(self):
        self._latency_buffer = 0.0
        self._last_signal = None
        self._last_outcome = None

    @property
    def latency_buffer(self) -> float:
        return self._latency_buffer

    def trigger(self, signal: ReflexSignal) -> ReflexOutcome:
        self._last_signal = signal
        self._last_outcome = ReflexOutcome(f"Triggered: {signal.signal}")
        self._latency_buffer += 0.01
        return self._last_outcome

    def flush(self) -> None:
        self._latency_buffer = 0.0
        self._last_signal = None
        self._last_outcome = None
