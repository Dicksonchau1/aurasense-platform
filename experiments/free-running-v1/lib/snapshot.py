import os, time
from . import substrate_io

class WeightSnapshotter:
    def __init__(self, out_dir, substrate):
        self.out_dir = out_dir
        self.substrate = substrate
        self._tick_hours = 6
        self._last_snapshot = time.monotonic()
        os.makedirs(out_dir, exist_ok=True)
        self._idx = 0
    def maybe_snapshot(self, label=None):
        now = time.monotonic()
        if now - self._last_snapshot >= self._tick_hours * 3600 or label:
            self.force_snapshot(label or f"tick{self._idx}")
    def force_snapshot(self, label):
        weights = substrate_io.get_weights_blob(self.substrate)
        fname = f"snapshot-{self._idx:02d}-{label}.bin"
        with open(os.path.join(self.out_dir, fname), "wb") as f:
            f.write(weights)
        self._last_snapshot = time.monotonic()
        self._idx += 1
