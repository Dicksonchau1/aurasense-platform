import unittest
import numpy as np
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from substrate import Substrate
from plasticity import PlasticityController
from envelope import Envelope
from audit_event import AuditEvent

class TestSubstrate(unittest.TestCase):
    def test_connect_disconnect(self):
        s = Substrate(config={})
        s.connect()
        self.assertTrue(s.connected)
        s.disconnect()
        self.assertFalse(s.connected)

    def test_export_import_weights(self):
        pc = PlasticityController()
        arr = np.ones((10, 10))
        pc.step(arr)
        pc.export_weights('test_weights.npy')
        pc.reset()
        pc.import_weights('test_weights.npy')
        self.assertTrue(np.allclose(pc._weights, arr @ arr.T * 0.01))

    def test_envelope(self):
        env = Envelope(session_id='s', timestamp=0.0, payload={}, trust_level=1.0, policy_refs=[])
        self.assertEqual(env.session_id, 's')

    def test_audit_event(self):
        ae = AuditEvent(event_id='e', session_id='s', event_type='t', channel='c', payload={}, timestamp=0.0, agent_id='a')
        self.assertEqual(ae.event_id, 'e')

if __name__ == '__main__':
    unittest.main()
