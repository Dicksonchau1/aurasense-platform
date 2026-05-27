import pytest
import asyncio
from atlas_learning.cdc.postgres_cdc import AuditCDCStream
from atlas_learning.tuples.tuple_schema import RawAuditEvent

class DummyConn:
    def __init__(self, rows):
        self.rows = rows
        self.idx = 0
    async def fetch(self, *args, **kwargs):
        if self.idx >= len(self.rows):
            return []
        batch = self.rows[self.idx:self.idx+1000]
        self.idx += len(batch)
        return batch
    async def fetchval(self, *args, **kwargs):
        return "0/0"
    async def execute(self, *args, **kwargs):
        return None

@pytest.mark.asyncio
async def test_cdc_stream():
    # 1000 synthetic events
    rows = [{
        "event_id": f"e{i}", "ts": None, "tenant_id": "t1", "source_module": "core",
        "event_type": "MISSION_ASSIGNED", "payload": {}, "prev_chain_hash": "h", "chain_hash": "h2",
        "signer_id": "s", "lsn": str(i)
    } for i in range(1000)]
    cdc = AuditCDCStream("dsn")
    cdc._tail = lambda conn: DummyConn(rows).fetch()  # Patch for test
    cdc._ensure_slot = lambda conn: None
    async def run():
        out = []
        async for event in cdc.stream():
            out.append(event)
            if len(out) >= 1000:
                break
        return out
    events = await run()
    assert len(events) == 1000
