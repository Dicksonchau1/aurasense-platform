import numpy as np

def synthetic_envelope_stream(seed=42, count=100_000, shape=(128,)):
    rng = np.random.default_rng(seed)
    for _ in range(count):
        yield rng.standard_normal(shape).astype(np.float32)
