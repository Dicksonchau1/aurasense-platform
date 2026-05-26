-- 20260527_physics_and_spatial_extensions.sql — Block 1: schema extensions
alter table public.drones
  add column if not exists airframe_id text,
  add column if not exists mass_kg numeric,
  add column if not exists arm_length_m numeric,
  add column if not exists prop_diameter_m numeric,
  add column if not exists prop_pitch_m numeric,
  add column if not exists max_thrust_per_motor_n numeric,
  add column if not exists motor_count integer,
  add column if not exists motor_kv integer,
  add column if not exists frontal_area_m2 numeric,
  add column if not exists drag_coefficient numeric,
  add column if not exists inertia_ixx numeric,
  add column if not exists inertia_iyy numeric,
  add column if not exists inertia_izz numeric,
  add column if not exists battery_cells_series integer,
  add column if not exists battery_capacity_ah numeric,
  add column if not exists hover_current_a numeric,
  add column if not exists spec_source text;
create index if not exists drones_airframe_id_idx on public.drones(airframe_id);

alter table public.buildings
  add column if not exists footprint geometry(Polygon, 4326),
  add column if not exists footprint_hk1980 geometry(Polygon, 2326),
  add column if not exists mbis_id text,
  add column if not exists obj_url text,
  add column if not exists gltf_url text,
  add column if not exists ifc_url text,
  add column if not exists rotation_deg numeric default 0,
  add column if not exists scale_factor numeric default 1,
  add column if not exists source text default 'manual',
  add column if not exists risk_score numeric;

do $$ begin
  alter table public.buildings
    add constraint buildings_source_check
    check (source in ('manual','mbis','cad','lidar','procedural'));
exception when duplicate_object then null;
end $$;

create index if not exists buildings_footprint_gix on public.buildings using gist (footprint);
create index if not exists buildings_mbis_id_idx on public.buildings(mbis_id);

create table if not exists public.batteries (
  id uuid primary key default gen_random_uuid(),
  serial text unique not null,
  airframe_id text,
  drone_id uuid references public.drones(id) on delete set null,
  chemistry text not null default 'LiPo',
  cells_series int not null,
  capacity_initial_ah numeric not null,
  capacity_current_ah numeric not null,
  cycles int not null default 0,
  internal_r_milliohm numeric,
  manufactured_at date,
  retired boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists batteries_drone_id_idx on public.batteries(drone_id);
create index if not exists batteries_retired_idx on public.batteries(retired);

create table if not exists public.wear_state (
  id uuid primary key default gen_random_uuid(),
  drone_id uuid not null references public.drones(id) on delete cascade,
  motor_index int not null,
  observed_at timestamptz not null default now(),
  efficiency_ratio numeric not null,
  rpm_load_factor numeric,
  thermal_bias_c numeric,
  vibration_sigma numeric,
  source text not null check (source in ('measured','synthetic','interpolated')),
  calibration_bundle_hash text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists wear_state_drone_motor_observed_uq on public.wear_state(drone_id, motor_index, observed_at);
create index if not exists wear_state_drone_id_idx on public.wear_state(drone_id);
create index if not exists wear_state_observed_at_idx on public.wear_state(observed_at desc);

create table if not exists public.weather_samples (
  id uuid primary key default gen_random_uuid(),
  station text not null,
  observed_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  temperature_c numeric,
  humidity_pct numeric,
  uv_index numeric,
  rainfall_mm_1h numeric,
  wind_speed_ms numeric,
  wind_dir_deg numeric,
  wind_gust_ms numeric,
  pressure_hpa numeric,
  warnings text[],
  raw jsonb not null,
  source text not null default 'hko_rhrread'
);
create unique index if not exists weather_samples_station_observed_uq on public.weather_samples(station, observed_at);
create index if not exists weather_samples_observed_at_idx on public.weather_samples(observed_at desc);

create table if not exists public.sim_runs (
  id uuid primary key default gen_random_uuid(),
  flight_plan_id uuid references public.flight_plans(id) on delete set null,
  drone_id uuid references public.drones(id) on delete set null,
  airframe_id text,
  physics_bundle_hash text not null,
  weather_sample_id uuid references public.weather_samples(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  outcome text,
  alerts_count int default 0,
  steps_count int default 0,
  energy_total_j numeric,
  final_state jsonb,
  audit_event_id uuid references public.audit_events(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sim_runs_flight_plan_idx on public.sim_runs(flight_plan_id);
create index if not exists sim_runs_drone_id_idx on public.sim_runs(drone_id);
create index if not exists sim_runs_bundle_hash_idx on public.sim_runs(physics_bundle_hash);
create index if not exists sim_runs_started_at_idx on public.sim_runs(started_at desc);

-- Block 2: triggers + RLS
create or replace function public.set_updated_at()
returns trigger language plpgsql as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

drop trigger if exists batteries_set_updated_at on public.batteries;
create trigger batteries_set_updated_at before update on public.batteries
  for each row execute function public.set_updated_at();

alter table public.batteries enable row level security;
alter table public.wear_state enable row level security;
alter table public.weather_samples enable row level security;
alter table public.sim_runs enable row level security;

drop policy if exists weather_samples_select on public.weather_samples;
create policy weather_samples_select on public.weather_samples for select using (auth.role() = 'authenticated');

drop policy if exists weather_samples_service_write on public.weather_samples;
create policy weather_samples_service_write on public.weather_samples for all using (auth.role() = 'service_role');

drop policy if exists sim_runs_select on public.sim_runs;
create policy sim_runs_select on public.sim_runs for select using (auth.role() = 'authenticated');

drop policy if exists sim_runs_service_all on public.sim_runs;
create policy sim_runs_service_all on public.sim_runs for all using (auth.role() = 'service_role');

drop policy if exists wear_state_select on public.wear_state;
create policy wear_state_select on public.wear_state for select using (auth.role() = 'authenticated');

drop policy if exists wear_state_service_all on public.wear_state;
create policy wear_state_service_all on public.wear_state for all using (auth.role() = 'service_role');

drop policy if exists batteries_select on public.batteries;
create policy batteries_select on public.batteries for select using (auth.role() = 'authenticated');

drop policy if exists batteries_service_all on public.batteries;
create policy batteries_service_all on public.batteries for all using (auth.role() = 'service_role');

-- Block 2: triggers + RLS
create or replace function public.set_updated_at()
returns trigger language plpgsql as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

drop trigger if exists batteries_set_updated_at on public.batteries;
create trigger batteries_set_updated_at before update on public.batteries
  for each row execute function public.set_updated_at();

alter table public.batteries enable row level security;
alter table public.wear_state enable row level security;
alter table public.weather_samples enable row level security;
alter table public.sim_runs enable row level security;

drop policy if exists weather_samples_select on public.weather_samples;
create policy weather_samples_select on public.weather_samples for select using (auth.role() = 'authenticated');

drop policy if exists weather_samples_service_write on public.weather_samples;
create policy weather_samples_service_write on public.weather_samples for all using (auth.role() = 'service_role');

drop policy if exists sim_runs_select on public.sim_runs;
create policy sim_runs_select on public.sim_runs for select using (auth.role() = 'authenticated');

drop policy if exists sim_runs_service_all on public.sim_runs;
create policy sim_runs_service_all on public.sim_runs for all using (auth.role() = 'service_role');

drop policy if exists wear_state_select on public.wear_state;
create policy wear_state_select on public.wear_state for select using (auth.role() = 'authenticated');

drop policy if exists wear_state_service_all on public.wear_state;
create policy wear_state_service_all on public.wear_state for all using (auth.role() = 'service_role');

drop policy if exists batteries_select on public.batteries;
create policy batteries_select on public.batteries for select using (auth.role() = 'authenticated');

drop policy if exists batteries_service_all on public.batteries;
create policy batteries_service_all on public.batteries for all using (auth.role() = 'service_role');

-- Block 3: reference airframe seeds (idempotent on serial)
insert into public.drones (name, model, serial, airframe_id, mass_kg, arm_length_m,
  prop_diameter_m, prop_pitch_m, max_thrust_per_motor_n, motor_count, motor_kv,
  frontal_area_m2, drag_coefficient, inertia_ixx, inertia_iyy, inertia_izz,
  battery_cells_series, battery_capacity_ah, hover_current_a, spec_source, status)
values
  ('Reference Mavic 3E', 'DJI Mavic 3 Enterprise', 'REF-M3E-001',
   'dji-mavic-3-enterprise', 0.915, 0.124, 0.241, 0.114, 6.8, 4, 920,
   0.018, 1.1, 0.0082, 0.0082, 0.0148, 4, 5.0, 6.2, 'manufacturer', 'idle'),
  ('Reference M30T', 'DJI Matrice 30T', 'REF-M30T-001',
   'dji-matrice-30t', 3.998, 0.220, 0.381, 0.140, 28.4, 4, 350,
   0.092, 1.2, 0.0820, 0.0845, 0.1480, 12, 5.880, 24.0, 'manufacturer', 'idle'),
  ('Reference M350 RTK', 'DJI Matrice 350 RTK', 'REF-M350-001',
   'dji-matrice-350-rtk', 6.470, 0.342, 0.533, 0.178, 48.1, 4, 100,
   0.180, 1.2, 0.32, 0.32, 0.58, 12, 17.4, 28.0, 'manufacturer', 'idle')
on conflict (serial) do update set
  airframe_id = excluded.airframe_id,
  mass_kg = excluded.mass_kg,
  arm_length_m = excluded.arm_length_m,
  prop_diameter_m = excluded.prop_diameter_m,
  prop_pitch_m = excluded.prop_pitch_m,
  max_thrust_per_motor_n = excluded.max_thrust_per_motor_n,
  motor_count = excluded.motor_count,
  motor_kv = excluded.motor_kv,
  frontal_area_m2 = excluded.frontal_area_m2,
  drag_coefficient = excluded.drag_coefficient,
  inertia_ixx = excluded.inertia_ixx,
  inertia_iyy = excluded.inertia_iyy,
  inertia_izz = excluded.inertia_izz,
  battery_cells_series = excluded.battery_cells_series,
  battery_capacity_ah = excluded.battery_capacity_ah,
  hover_current_a = excluded.hover_current_a,
  spec_source = excluded.spec_source;
