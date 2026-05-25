import unittest
import numpy as np
from nepa_substrate.python.plasticity import PlasticityController

class TestPlasticityController(unittest.TestCase):
    def test_step_and_reset(self):
        pc = PlasticityController()
        arr = np.ones((10, 10))
        out = pc.step(arr)
        self.assertTrue(np.allclose(out, np.ones((10, 10)) * 0.01))
        self.assertAlmostEqual(pc.last_step_delta, 0.1)
        pc.reset()
        self.assertTrue(np.allclose(pc._weights, 0))

if __name__ == "__main__":
    unittest.main()
