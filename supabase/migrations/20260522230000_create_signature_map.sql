-- supabase/migrations/20260522230000_create_signature_map.sql
-- signature_map: 3D spatial index of physical-law signatures
-- Architectural Lock #4 (2026-05-22)

create extension if not exists postgis;

create table public.signature_map (
  id                   uuid primary key default gen_random_uuid(),

  -- Geometric anchor
  h3_cell              text not null,
  altitude_band        text not null check (altitude_band in ('ground','low','mid','high')),
  lat                  double precision not null,
  lon                  double precision not null,
  alt_m                double precision not null,

  -- Structural anchor
  object_id            text not null,
  structural_class     text not null,
  node_id              text,
  object_metadata      jsonb not null default '{}',

  -- Regime anchor
  regime_hash          text not null,
  regime_anchor        jsonb not null,

  -- Signature payload
  signature_type       text not null,
  signature_payload    jsonb not null,

  -- Contribution provenance
  deployment_id        text not null,
  run_id               text not null,
  frame_id             text not null,
  audit_hash           text not null,
  chain_hash           text not null,
  contributed_at       timestamptz not null default now(),

  -- Row timestamps
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Spatial neighbourhood query (H3 ring lookup)
create index idx_signature_map_h3
  on public.signature_map (h3_cell);

-- Structural class + object lookup
create index idx_signature_map_structural
  on public.signature_map (structural_class, object_id);

-- Exact-regime matching
create index idx_signature_map_regime
  on public.signature_map (regime_hash);

-- Audit chain traceability
create index idx_signature_map_audit
  on public.signature_map (run_id, frame_id);

-- RLS
alter table public.signature_map enable row level security;

create policy "read_signature_map"
  on public.signature_map for select
  using (true);

create policy "write_signature_map"
  on public.signature_map for insert
  with check (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_signature_map_updated_at
  before update on public.signature_map
  for each row execute procedure public.set_updated_at();
