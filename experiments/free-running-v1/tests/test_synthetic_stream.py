from lib.synthetic_stream import synthetic_envelope_stream
import numpy as np

def test_synthetic_stream():
    s1 = list(synthetic_envelope_stream(seed=123, count=10))
    s2 = list(synthetic_envelope_stream(seed=123, count=10))
    for a, b in zip(s1, s2):
        assert np.allclose(a, b)
