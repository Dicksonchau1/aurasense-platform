"""
PlasticityController: Adaptive update engine for NEPA substrate.
"""
from typing import Any
import numpy as np

class AdaptationTrace:
    def __init__(self, trace=None):
        self.trace = trace or []

class PlasticityController:
    def __init__(self):
        self._last_step_delta = 0.0
        self._weights = np.zeros((10, 10))
        self._trace = AdaptationTrace()

    def step(self, inputs: np.ndarray) -> np.ndarray:
        delta = inputs @ inputs.T * 0.01
        self._weights += delta
        self._last_step_delta = float(np.sum(np.abs(delta)))
        self._trace.trace.append(self._last_step_delta)
        return self._weights.copy()

    @property
    def last_step_delta(self) -> float:
        return self._last_step_delta

    def reset(self) -> None:
        self._weights = np.zeros_like(self._weights)
        self._last_step_delta = 0.0
        self._trace = AdaptationTrace()

    def get_trace(self) -> AdaptationTrace:
        return self._trace

    def export_weights(self, path: str) -> None:
        np.save(path, self._weights)

    def import_weights(self, path: str) -> None:
        self._weights = np.load(path)
