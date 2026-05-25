from lib.metrics import mutual_information
import numpy as np

def test_mutual_information():
    env = np.random.randint(0, 10, 1000)
    act = np.random.randint(0, 10, 1000)
    pairs = list(zip(env, act))
    mi = mutual_information(pairs)
    assert mi >= 0
