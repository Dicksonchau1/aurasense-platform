-- Cross-cutting audit chain migration for ATLAS Elite
create table audit_events (
  event_id        uuid primary key default gen_random_uuid(),
  ts              timestamptz not null default now(),
  tenant_id       text not null,
  source_module   text not null,
  event_type      text not null,
  payload         jsonb not null,
  prev_chain_hash text not null,
  chain_hash      text not null,
  signer_id       text not null
);
create index on audit_events (tenant_id, ts desc);
create index on audit_events (event_type, ts desc);
