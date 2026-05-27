import pytest
import asyncio
from atlas_learning.tuples.assembler import TupleAssembler
from atlas_learning.tuples.reward_calculator import RewardCalculator
from atlas_learning.tuples.feature_extractor import FeatureExtractor
from atlas_learning.tuples.tuple_schema import RawAuditEvent
from datetime import datetime, timedelta

class DummyFeatureExtractor(FeatureExtractor):
    async def from_state_hash(self, state_hash):
        return [1.0, 2.0, 3.0]
    def from_action(self, action_payload):
        return [0.5, 0.5, 0.5]

@pytest.mark.asyncio
async def test_soak_tuple_assembly():
    reward_calc = RewardCalculator()
    features = DummyFeatureExtractor("")
    assembler = TupleAssembler(reward_calc, features, max_horizon_s=60)
    now = datetime.utcnow()
    # Generate 1000 synthetic decision/outcome pairs
    async def stream():
        for i in range(1000):
            dec = RawAuditEvent(
                event_id=f"d{i}", ts=now + timedelta(seconds=i), tenant_id="t1", source_module="core",
                event_type="MISSION_ASSIGNED", payload={"robotId": "r1", "stateHash": "s1"}, chain_hash="h1"
            )
            out = RawAuditEvent(
                event_id=f"o{i}", ts=now + timedelta(seconds=i+10), tenant_id="t1", source_module="core",
                event_type="MISSION_COMPLETED", payload={"robotId": "r1", "stateHash": "s2"}, chain_hash="h2"
            )
            yield dec
            yield out
    tuples = [t async for t in assembler.process(stream())]
    assert len(tuples) >= 800
