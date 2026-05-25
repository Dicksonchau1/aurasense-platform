import unittest
from nepa_substrate.python.substrate import Substrate, SubstrateConfig

class TestSubstrate(unittest.TestCase):
    def test_lifecycle(self):
        s = Substrate(SubstrateConfig())
        self.assertEqual(s.status().status, "disconnected")
        s.connect()
        self.assertEqual(s.status().status, "connected")
        s.disconnect()
        self.assertEqual(s.status().status, "disconnected")

if __name__ == "__main__":
    unittest.main()
