"""
CouplingLog: Bounded in-memory log of coupling events.
"""
from typing import List

class CouplingEvent:
    def __init__(self, event: str, timestamp: float):
        self.event = event
        self.timestamp = timestamp

class CouplingLog:
    def __init__(self, max_size: int = 1000):
        self._events: List[CouplingEvent] = []
        self._max_size = max_size

    def append(self, event: CouplingEvent) -> None:
        self._events.append(event)
        if len(self._events) > self._max_size:
            self._events = self._events[-self._max_size:]

    def tail(self, n: int) -> List[CouplingEvent]:
        return self._events[-n:]

    def export(self, path: str) -> None:
        import json
        with open(path, 'w') as f:
            json.dump([e.__dict__ for e in self._events], f)
