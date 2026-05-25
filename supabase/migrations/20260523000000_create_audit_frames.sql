-- supabase/migrations/20260523000000_create_audit_frames.sql
-- audit_frames: hash-chained provenance log for captured high-modulator frames
-- PR D-2 (2026-05-23) — Step 2 of post-Lock-#4 implementation wave

create table public.audit_frames (
  id                    uuid primary key default gen_random_uuid(),

  -- Session identity
  deployment_id         text not null,
  run_id                text not null,
  frame_id              text not null,
  tick                  integer not null,

  -- Frame payload + 3D anchors (DESIGN-S16A §16-A.1)
  content               jsonb not null,
  geometric_anchor      jsonb not null,
  structural_anchor     jsonb not null,
  regime_anchor         jsonb not null,

  -- Hash chain
  audit_hash            text not null,         -- SHA-256 of deterministic stringify(content)
  chain_hash            text not null,         -- SHA-256(previous_chain_hash || audit_hash)
  previous_chain_hash   text not null,         -- 64-zero string for genesis

  captured_at           timestamptz not null default now(),
  created_at            timestamptz not null default now(),

  -- Uniqueness on chain link: prevents duplicate chain entries per run
  unique (run_id, chain_hash),
  unique (frame_id)
);

create index idx_audit_frames_run_tick
  on public.audit_frames (run_id, tick);

create index idx_audit_frames_deployment_run
  on public.audit_frames (deployment_id, run_id, captured_at desc);

-- View: latest chain tip per (deployment_id, run_id)
create or replace view public.audit_chain_tips as
select distinct on (deployment_id, run_id)
  deployment_id,
  run_id,
  chain_hash as tip_chain_hash,
  captured_at as tip_captured_at
from public.audit_frames
order by deployment_id, run_id, captured_at desc, id desc;

-- RLS
alter table public.audit_frames enable row level security;

create policy "read_audit_frames"
  on public.audit_frames for select
  using (true);

create policy "write_audit_frames"
  on public.audit_frames for insert
  with check (auth.role() = 'service_role');