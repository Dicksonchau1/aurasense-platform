import unittest
from nepa_substrate.python.audit_event import AuditEvent

class TestAuditEvent(unittest.TestCase):
    def test_audit_event(self):
        ae = AuditEvent(event_id="e1", session_id="s1", event_type="type", channel="ch", payload={}, timestamp=1.0, agent_id="a1")
        self.assertEqual(ae.event_id, "e1")

if __name__ == "__main__":
    unittest.main()
