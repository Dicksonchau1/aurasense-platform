class DummyAudioSource:
    def __init__(self):
        self.idx = 0
        self.closed = False
    def read(self):
        # Return dummy audio data
        self.idx += 1
        return np.zeros(1024, dtype=np.float32) + self.idx
    def close(self):
        self.closed = True

from abc import ABC, abstractmethod
from typing import Iterator
import numpy as np

class InputSource(ABC):
    """Common interface for Path A (real sensors) and Path B (ATLAS world)."""
    @abstractmethod
    def envelopes(self) -> Iterator[np.ndarray]: ...
    @abstractmethod
    def activity_rate_hz(self) -> float: ...
    @abstractmethod
    def close(self) -> None: ...
    @property
    @abstractmethod
    def path_label(self) -> str: ...   # "A" or "B"

def make_source(path: str, **kwargs) -> InputSource:
    if path == 'a':
        try:
            return CameraSource()
        except Exception:
            # Fallback to dummy audio source for headless/test
            return DummyAudioSource()
    elif path == 'b':
        return SyntheticSource(kwargs.get('world_id', None))
    else:
        return DummyAudioSource()
