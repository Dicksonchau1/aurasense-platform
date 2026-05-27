import numpy as np
from typing import List
from ..tuples.tuple_schema import LearningTuple

class PrioritizedReplayBuffer:
    """Prioritized experience replay (Schaul et al. 2015) with importance
    sampling weights. High-TD-error tuples get sampled more often,
    which accelerates learning on rare/edge-case decisions — exactly
    where fleet scheduling needs improvement."""

    def __init__(self, capacity: int = 1_000_000,
                 alpha: float = 0.6, beta_start: float = 0.4):
        self.capacity = capacity
        self.alpha = alpha
        self.beta = beta_start
        self.tuples: List[LearningTuple] = []
        self.priorities = np.zeros(capacity, dtype=np.float32)
        self.write_idx = 0
        self.size = 0

    def add(self, tup: LearningTuple, td_error: float = 1.0) -> None:
        priority = (abs(td_error) + 1e-6) ** self.alpha
        if self.size < self.capacity:
            self.tuples.append(tup)
            self.size += 1
        else:
            self.tuples[self.write_idx] = tup
        self.priorities[self.write_idx] = priority
        self.write_idx = (self.write_idx + 1) % self.capacity

    def sample(self, batch_size: int) -> tuple[List[LearningTuple], np.ndarray, np.ndarray]:
        probs = self.priorities[:self.size] / self.priorities[:self.size].sum()
        idx = np.random.choice(self.size, batch_size, p=probs)
        weights = (self.size * probs[idx]) ** (-self.beta)
        weights /= weights.max()
        return [self.tuples[i] for i in idx], idx, weights.astype(np.float32)

    def update_priorities(self, idx: np.ndarray, td_errors: np.ndarray) -> None:
        for i, err in zip(idx, td_errors):
            self.priorities[i] = (abs(err) + 1e-6) ** self.alpha

    def anneal_beta(self, fraction: float) -> None:
        self.beta = min(1.0, self.beta + fraction * (1.0 - 0.4))
