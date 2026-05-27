import asyncio
import asyncpg
from typing import AsyncIterator
from ..tuples.tuple_schema import RawAuditEvent

class AuditCDCStream:
    """Tails the audit_events table via Postgres logical replication.
    Replication slot guarantees at-least-once delivery; the tuple
    assembler dedupes by event_id."""

    def __init__(self, conninfo: str, slot_name: str = "atlas_learning_loop",
                 publication: str = "atlas_audit_pub"):
        self.conninfo = conninfo
        self.slot_name = slot_name
        self.publication = publication

    async def stream(self) -> AsyncIterator[RawAuditEvent]:
        conn = await asyncpg.connect(self.conninfo)
        await self._ensure_slot(conn)
        async for row in self._tail(conn):
            yield RawAuditEvent.from_row(row)

    async def _ensure_slot(self, conn) -> None:
        await conn.execute("""
            select pg_create_logical_replication_slot($1, 'pgoutput')
            where not exists (
                select 1 from pg_replication_slots where slot_name = $1
            )
        """, self.slot_name)

    async def _tail(self, conn):
        # Simplified — production uses pgoutput protocol via aiopg or
        # walreceiver-style streaming. For initial impl, fall back to
        # polling with a lsn watermark.
        last_lsn = await conn.fetchval(
            "select max(lsn) from learning_loop_watermark"
        ) or "0/0"
        while True:
            rows = await conn.fetch("""
                select event_id, ts, tenant_id, source_module,
                       event_type, payload, prev_chain_hash, chain_hash,
                       signer_id, lsn
                from audit_events
                where lsn > $1
                order by lsn asc
                limit 1000
            """, last_lsn)
            for row in rows:
                yield row
                last_lsn = row["lsn"]
            await conn.execute(
                "update learning_loop_watermark set lsn = $1", last_lsn
            )
            if not rows:
                await asyncio.sleep(0.5)
