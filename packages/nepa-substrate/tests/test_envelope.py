import unittest
from nepa_substrate.python.envelope import Envelope

class TestEnvelope(unittest.TestCase):
    def test_envelope_serialization(self):
        e = Envelope(session_id="sid", timestamp=1.0, payload={"x":1}, trust_level=0.9, policy_refs=["p1"])
        import json
        s = json.dumps(e.__dict__)
        self.assertIn('session_id', s)

if __name__ == "__main__":
    unittest.main()
